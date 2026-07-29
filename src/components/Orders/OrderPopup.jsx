import React, { useEffect, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DialogTitle, TextField } from '@mui/material';
import { styled } from '@mui/material';
import { ContainerButton } from './styles';
import { Button } from '../Button';
import { ConfirmationDialog } from '../Products/ConfirmationDialog';
import { createOrder } from '../../api';
import { useDatabaseContext } from '../../context/DbContext';
import { useAuth } from '../../context/AuthContext';

// O pedido manual não tem hora: normalizamos para MEIO-DIA local. Meia-noite BRT
// (o antigo hack de +3h) cai em 03:00Z e diverge entre as três leituras de data —
// dia-calendário SP (listagem), dia de negócio com corte 03:00 (daily_sales) e o
// dump. Ao meio-dia as três resolvem para o mesmo dia.
const atLocalNoon = (date) => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  return d;
};

// 'yyyy-mm-dd' pelos campos LOCAIS (toISOString converteria para UTC e poderia
// exibir o dia anterior).
const toInputDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;

// Chave de idempotência da submissão, enviada no lugar do antigo token '999999' (que se
// repetia em todos os pedidos e por isso nunca deduplicava). Vira o order_id no dump: um
// retry da MESMA submissão conflita e atualiza a linha; um pedido novo recebe outra chave.
// 1.785e15 < 2^53 e cabe em bigint; muito acima de numericUuid (~1e7), da migração
// histórica (≤2e12) e dos offsets de loja física (3e12 / 4e12).
const novaChave = () =>
  String(Date.now() * 1000 + Math.floor(Math.random() * 1000));

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': {
    padding: '1rem',
  },
}));

const DialogTitleCustom = styled(DialogTitle)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '2rem',
  fontWeight: '600',
  textAlign: 'center',
});

const TextFieldInput = styled(TextField)({
  minWidth: '25vw',
  fontFamily: "'Poppins', sans-serif",
  '& .MuiInputBase-input, & label': {
    fontSize: '1.4rem',
  },
  '& label, & .MuiInputBase-input': {
    fontFamily: "'Poppins', sans-serif",
  },
  '& .MuiInputBase-root': {
    borderRadius: '8px 8px 0 0',
    border: 'none',
    backgroundColor: 'var(--geralwhite)',
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.25)',
  },
  '& .css-batk84-MuiInputBase-root-MuiFilledInput-root::before': {
    borderBottom: 'none',
  },
});

export function OrderPopup({ open, onClose, store = 'artepropria' }) {
  const { user } = useAuth();
  const { reloadData } = useDatabaseContext();
  const [createdAt, setCreatedAt] = useState(() => atLocalNoon(new Date()));
  const [total, setTotal] = useState('0');
  const [totalClientesRecorrentes, setTotalClientesRecorrentes] = useState('0');

  const [note, setNote] = useState('');
  const [clientsPerDay, setClientsPerDay] = useState('0');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [idempotencyKey, setIdempotencyKey] = useState(novaChave);

  // Cada abertura do popup inicia uma submissão nova. Dentro da mesma abertura a chave
  // NÃO muda, para que um retry após erro caia no ON CONFLICT do backend em vez de duplicar.
  useEffect(() => {
    if (open) {
      setIdempotencyKey(novaChave());
      setErrorMessage('');
      setWarningMessage('');
    }
  }, [open]);

  const resetInputs = () => {
    setCreatedAt(atLocalNoon(new Date()));
    setTotal('0');
    setNote('');
    setTotalClientesRecorrentes('0');
    setClientsPerDay('0');
    setErrorMessage('');
    setWarningMessage('');
    setIdempotencyKey(novaChave());
  };

  const handleDateChange = e => {
    // <input type="date"> devolve 'YYYY-MM-DD', que o construtor de Date interpreta
    // como meia-noite UTC. Fatiamos os campos para montar a data no fuso local.
    const [year, month, day] = e.target.value.split('-').map(Number);
    if (!year || !month || !day) return;
    const date = atLocalNoon(new Date(year, month - 1, day));
    if (!isNaN(date)) {
      setCreatedAt(date);
    }
  };
  const handleclientsPerDay = e => {
    setClientsPerDay(e.target.value);
  };

  const handleNote = e => {
    setNote(e.target.value);
  };

  const formatCurrency = value => {
    // Remove qualquer coisa que não seja número ou ponto
    value = value.replace(/\D/g, '');

    // Converte para número e divide por 100 para manter duas casas decimais
    value = (value / 100).toFixed(2);

    // Formata o número para o formato BRL
    value = value.replace('.', ',');

    // Formata com separador de milhar
    value = value.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    return `R$ ${value}`;
  };

  const handleAddOrder = async () => {
    // Um duplo clique em "Confirmar" disparava dois POSTs (e dois inserts no dump).
    if (loading) return;

    try {
      setLoading(true);
      setErrorMessage('');
      setWarningMessage('');

      // `displayName` é nulo em contas de e-mail/senha do Firebase. Antes o payload era
      // montado FORA do try e o .split() rebentava sem nenhuma mensagem na tela.
      const operador = user.displayName || user.email || 'Operador';

      const cleanedTotal = total.replace(/[^0-9,-]+/g, '').replace(',', '.');
      const cleanedTotalClientesRecorrentes = totalClientesRecorrentes.replace(/[^0-9,-]+/g, '').replace(',', '.');

      const newOrder = {
        data: {
          created_at: createdAt,
          weight: '',
          coupon: [],
          customer: {
            name: operador,
            email: user.email,
            identification: '99999999999',
          },
          has_shippable_products: '',
          paid_at: createdAt,
          payment_count: 1,
          payment_details: {
            method: 'loja',
          },
          payment_status: 'paid',
          products: [
            {
              name: 'Produto Loja',
              name_without_variants: 'Produto Loja',
              price: parseFloat(cleanedTotal),
              sku: 'produto-loja',
              quantity: clientsPerDay,
            },
          ],
          shipping_address: {
            city: 'São Paulo',
            province: 'São Paulo',
            country: 'BR',
            created_at: createdAt,
            floor: 'Loja',
            locality: 'Loja',
            name: user.displayName,
          },
          shipping_cost_customer: '0.00',
          shipping_cost_owner: cleanedTotalClientesRecorrentes,
          shipping_max_days: 0,
          shipping_min_days: 0,
          shipping_suboption: {},
          store_id: 1146504,
          subtotal: cleanedTotal,
          total: cleanedTotal,
          updated_at: createdAt,
          shipping_carrier_name: 'Loja',
          landing_url: 'https://www.artepropria.com.br/',
          language: 'pt',
          billing_address: '',
          billing_business_name: '',
          billing_city: 'São Paulo',
          billing_country: 'BR',
          billing_floor: 'Loja',
          billing_locality: 'Loja',
          billing_name: 'Cliente Loja Física',
          billing_number: 'Loja',
          billing_phone: 'Loja',
          billing_province: 'São Paulo',
          note: note,
          storefront: 'Loja',
          owner_note: 'Chatbot',
          contact_email: user.email,
          contact_identification: '99999999999',
          contact_name: `Chatbot: ${operador.split(' ')[0]}`,
          contact_phone: '+5511999999999',
          shipping_option: 'Entrega Loja',
          currency: 'BRL',
          shipping_option_code: 'Entrega Loja',
          shipping_option_reference: 'Entrega Loja',
          status: 'closed',
          shipping_pickup_type: '',
          shipping_status: 'shipped',
          shipping: 'Entrega Loja',
          // Chave de idempotência da submissão (antes: '999999', igual em todo pedido, o
          // que impedia o ON CONFLICT do dump de deduplicar um reenvio).
          token: idempotencyKey,
          gateway: 'pagamento-loja',
          gateway_id: '9999',
          gateway_link: null,
          gateway_name: 'Pagamento Loja',
        },
      };

      const response = await createOrder([newOrder], store);

      // O backend só devolve erro quando NADA foi gravado. Chegando aqui o pedido existe;
      // `warnings` sinaliza que uma etapa posterior (orders_shop / daily_sales) falhou.
      const pendencias = response.warnings || [];
      const numero = response.orderId ? ` (nº ${response.orderId})` : '';

      if (pendencias.length > 0) {
        // Sucesso parcial: avisar em vez de dizer que falhou, senão o operador reenvia —
        // foi assim que nasceram as duplicatas de 25/07 presas só no dump legado.
        setLoading(false);
        setOpenConfirm(false);
        reloadData();
        setWarningMessage(
          `Pedido lançado${numero}, mas ainda não apareceu na listagem nova. Não reenvie — avise o suporte.`,
        );
        console.warn('Pedido cadastrado com pendências:', pendencias);
        return;
      }

      setSuccess(true);
      // Recarrega orders_shop (a tela nova); o fetchData legado batia em /customers
      // e não atualizava esta listagem.
      reloadData();
      setTimeout(() => {
        resetInputs();
        setLoading(false);
        setSuccess(false);
        onCloseConfirm(); // Fecha o popup de confirmação após o envio
        onClose(); // Fecha o popup após o envio
      }, 1000);
    } catch (error) {
      setLoading(false);
      setSuccess(false);
      // Sem feedback visível, a falha parecia travamento e o pedido era reenviado.
      // A chave de idempotência é mantida: reenviar ATUALIZA em vez de duplicar.
      setErrorMessage(
        'Não foi possível cadastrar o pedido. Confira na listagem antes de tentar de novo — se reenviar por aqui, o mesmo pedido é atualizado, não duplicado.',
      );
      setOpenConfirm(false);
      console.error('Erro ao cadastrar pedido:', error);
    }
  };

  const handleSubmit = () => {
    setErrorMessage('');
    setOpenConfirm(true);
  };

  const onCloseConfirm = () => {
    setOpenConfirm(false);
  };

  return (
    <>
      <StyledDialog open={open} onClose={onClose}>
        <DialogTitleCustom>Cadastrar Pedido</DialogTitleCustom>
        <DialogContent>
          <ContainerButton>
            <TextFieldInput
              variant='filled'
              label='Data da Compra'
              type='date'
              size='small'
              value={toInputDate(createdAt)} // Converte a data para o formato 'yyyy-mm-dd'
              onChange={handleDateChange}
              required
            />
            <TextFieldInput
              variant='filled'
              type='text'
              label='Total de Vendas'
              size='small'
              value={total}
              onChange={e => setTotal(formatCurrency(e.target.value))}
              required
            />
            <TextFieldInput
              variant='filled'
              type='text'
              label='Total de Vendas - Clientes Recorrentes'
              size='small'
              value={totalClientesRecorrentes}
              onChange={e =>
                setTotalClientesRecorrentes(formatCurrency(e.target.value))
              }
              required
            />
            <TextFieldInput
              variant='filled'
              type='number'
              label='Quantidade de Clientes'
              size='small'
              value={clientsPerDay}
              onChange={handleclientsPerDay}
              required
            />
            <TextFieldInput
              variant='filled'
              type='text'
              label='Observações'
              size='small'
              value={note}
              onChange={handleNote}
            />
          </ContainerButton>
          {errorMessage && (
            <p
              style={{
                color: 'var(--red, #d32f2f)',
                fontSize: '1.3rem',
                marginTop: '1rem',
                textAlign: 'center',
              }}
            >
              {errorMessage}
            </p>
          )}
          {warningMessage && (
            <p
              style={{
                color: 'var(--orange, #ed6c02)',
                fontSize: '1.3rem',
                marginTop: '1rem',
                textAlign: 'center',
              }}
            >
              {warningMessage}
            </p>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} className='simple'>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className='confirm'>
            Cadastrar
          </Button>
        </DialogActions>
      </StyledDialog>

      <ConfirmationDialog
        open={openConfirm}
        onClose={onCloseConfirm}
        onConfirm={handleAddOrder}
        loading={loading}
        success={success}
        action={'Cadastrar'}
      />
    </>
  );
}
