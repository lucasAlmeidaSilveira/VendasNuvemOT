import React, { useState } from 'react';
import { Popup } from '../Popup'; // Certifique-se de que esse componente está importado corretamente
import { useOrders } from '../../context/OrdersContext';
import { useRefunds } from '../../context/RefundsContext';
import { DatePicker } from '../DatePicker';
import { env } from '../../utils/env';

import './RefundPopup.css';

export function RefundPopup({ isPopupOpen, handleIsClosePopup }) {
  const { store } = useOrders(); // Obtém a loja do contexto
  const [orderNumber, setOrderNumber] = useState('');
  const [dateChoose, setDateChoose] = useState('');
  const [category, setCategory] = useState('');
  const [refundValue, setRefundValue] = useState('');
  const [refundType, setRefundType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Estado para mensagem de sucesso
  const { reloadRefunds } = useRefunds();

  const categories = [
    'Atraso',
    'Não gostou',
    'Avaria',
    'Envio/Logistica',
    'Produção/Defeito - Quadros',
    'Produção/Defeito - Espelhos',
    'OP Errada',
    'Extravio',
    'Troca',
    'Compra errada',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const newRefund = {
      order_id: Number(orderNumber),
      category,
      created_at: dateChoose,
      total: parseFloat(refundValue).toFixed(2),
      type: 'Reembolso',
      type_refund: refundType,
    };

    try {
      const response = await fetch(
        `${env.apiUrl}refunds/${store}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(newRefund),
        },
      );

      if (response.ok) {
        setSuccessMessage('Reembolso cadastrado com sucesso! ✅');
        setOrderNumber('');
        setCategory('');
        setRefundValue('');
        setRefundType('');
        setDateChoose('');
        setTimeout(() => {
          setSuccessMessage('');
          handleIsClosePopup(); // Fecha o popup automaticamente
          reloadRefunds(); //  Aciona a função que recarrega as informações
        }, 2000);
      } else {
        setSuccessMessage('Erro ao cadastrar reembolso! ❌');
        setTimeout(() => {
          setSuccessMessage('');
          handleIsClosePopup(); // Fecha o popup automaticamente
          reloadRefunds(); //  Aciona a função que recarrega as informações
        }, 2000);
        console.log('DEBUG erro:', error);
      }
    } catch (error) {
      setSuccessMessage('Erro na conexão com o servidor. ❌');
      setTimeout(() => {
        setSuccessMessage('');
        handleIsClosePopup(); // Fecha o popup automaticamente
        reloadRefunds(); //  Aciona a função que recarrega as informações
      }, 2000);
      console.log('DEBUG erro:', error);
      //console.log('DEBUG type: ', refundType);
      //console.log('DEBUG response:', newRefund);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup
      open={isPopupOpen}
      onClose={handleIsClosePopup}
      size="xs"
      title="Reembolsos"
    >
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage ? (
        <p className="popup-success">{successMessage}</p>
      ) : (
        <>
          <p className="popup-subtitle">Preencha os dados abaixo</p>
          <br />
          <form className="popup-form" onSubmit={handleSubmit}>
            <label>Número do pedido:</label>
            <input
              type="number"
              className="popup-input"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              required
            />
            <DatePicker
              label="Escolha a data:"
              value={dateChoose}
              onChange={setDateChoose}
            />
            <label>Categoria de reembolso:</label>
            <select
              className="popup-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Selecione uma opção</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <label>Valor reembolsado:</label>
            <input
              type="number"
              className="popup-input"
              step="0.01"
              value={refundValue}
              onChange={(e) => setRefundValue(e.target.value)}
              required
            />
            <label>Tipo de reembolso:</label>
            <div className="selected-type">
              <button
                type="button"
                className={`type-button_1 ${refundType === 'Total' ? 'active' : ''}`}
                onClick={() => setRefundType('Total')}
              >
                {refundType === 'Total'} Total
              </button>
              <button
                type="button"
                className={`type-button_2 ${refundType === 'Parcial' ? 'active' : ''}`}
                onClick={() => setRefundType('Parcial')}
              >
                {refundType === 'Parcial'} Parcial
              </button>
            </div>
            <button type="submit" className="popup-button">
              REGISTRAR
            </button>
          </form>
        </>
      )}
    </Popup>
  );
}
