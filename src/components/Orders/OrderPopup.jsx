import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import { DialogTitle, TextField } from '@mui/material';
import { styled } from '@mui/material';
import { ContainerButton } from './styles';
import { Button } from '../Button';
import { ConfirmationDialog } from '../Products/ConfirmationDialog';
import { createOrder } from '../../api';
import { useOrders } from '../../context/OrdersContext';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': {
    padding: '1rem',
  }
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

export function OrderPopup({ open, onClose }) {
  const { fetchAllOrders } = useOrders();
  const [contactName, setContactName] = useState('');
  const [ownerNote, setOwnerNote] = useState('');
  const [createdAt, setCreatedAt] = useState(new Date());
  const [total, setTotal] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [openConfirm, setOpenConfirm] = useState(false);

  const resetInputs = () => {
    setContactName('');
    setOwnerNote('');
    setCreatedAt(new Date());
    setTotal('0');
  };

  const handleDateChange = e => {
    const date = new Date(e.target.value);
    if (!isNaN(date)) {
      setCreatedAt(date);
    }
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
    const cleanedTotal = total.replace(/[^0-9,-]+/g, '').replace(',', '.');

    const newOrder = {
      data: {
        created_at: createdAt,
        weight: '',
        coupon: [],
        customer: {
          name: contactName,
          email: 'loja@artepropria.com',
          identification: "99999999999"
        },
        has_shippable_products: '',
        paid_at: createdAt,
        payment_count: 1,
        payment_details: {
          method: 'loja'
        },
        payment_status: 'paid',
        products: [{
          name: "Produto Loja",
          name_without_variants: "Produto Loja",
          price: parseFloat(cleanedTotal),
          sku: 'produto-loja',
          quantity: 1,

        }],
        shipping_address: {
          city: 'São Paulo',
          province: 'São Paulo',
          country: 'BR',
          created_at: createdAt,
          floor: ownerNote,
          locality: ownerNote,
          name: contactName,
        },
        shipping_cost_customer: '0.00',
        shipping_cost_owner: '0.00',
        shipping_max_days: 0,
        shipping_min_days: 0,
        shipping_suboption: {},
        store_id: 1146504,
        subtotal: parseFloat(cleanedTotal),
        total: parseFloat(cleanedTotal),
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
        billing_name: contactName,
        billing_number: 'Loja',
        billing_phone: 'Loja',
        billing_province: 'São Paulo',
        note: ownerNote,
        storefront: 'Loja',
        owner_note: ownerNote,
        contact_email: 'lojas@artepropria.com',
        contact_identification: '99999999999',
        contact_name: contactName,
        contact_phone: '+5511999999999',
        shipping_option: 'Entrega Loja',
        currency: 'BRL',
        shipping_option_code: 'Entrega Loja',
        shipping_option_reference: 'Entrega Loja',
        status: 'closed',
        shipping_pickup_type: '',
        shipping_status: 'shipped',
        shipping: 'Entrega Loja',
        token: '999999',
        gateway: 'pagamento-loja',
        gateway_id: '9999',
        gateway_link: 'https://www.artepropria.com.br/',
        gateway_name: 'Pagamento Loja',
      },
    };

    try {
      setLoading(true);
      const response = await createOrder([newOrder]);

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        fetchAllOrders()
        setTimeout(() => {
          resetInputs();
          setLoading(false);
          setSuccess(false);
          onCloseConfirm(); // Fecha o popup de confirmação após o envio
          onClose(); // Fecha o popup após o envio
        }, 1000);
      } else {
        throw new Error('Erro ao cadastrar pedido');
      }
    } catch (error) {
      setLoading(false);
      console.error('Erro ao cadastrar pedido:', error);
    }
  };

  const handleSubmit = () => {
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
              type='text'
              label='Nome do Cliente'
              size='small'
              value={contactName}
              onChange={e => setContactName(e.target.value)}
              required
            />
            <TextFieldInput
              variant='filled'
              type='text'
              label='Loja'
              size='small'
              value={ownerNote}
              onChange={e => setOwnerNote(e.target.value)}
              required
            />
            <TextFieldInput
              variant='filled'
              label='Data da Compra'
              type='date'
              size='small'
              value={createdAt.toISOString().split('T')[0]} // Converte a data para o formato 'yyyy-mm-dd'
              onChange={handleDateChange}
            />
            <TextFieldInput
              variant='filled'
              type='text'
              label='Total da Compra'
              size='small'
              value={total}
              onChange={e => setTotal(formatCurrency(e.target.value))}
              required
            />
          </ContainerButton>
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