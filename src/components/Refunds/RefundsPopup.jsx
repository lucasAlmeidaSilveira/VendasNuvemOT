import React, { useState } from 'react';
import { Popup } from '../Popup'; // Certifique-se de que esse componente está importado corretamente
import { useOrders } from '../../context/OrdersContext';
import './RefundPopup.css';

export function RefundPopup({ isPopupOpen, handleIsClosePopup }) {
  const { store } = useOrders(); // Obtém a loja do contexto
  const [orderNumber, setOrderNumber] = useState('');
  const [category, setCategory] = useState('');
  const [refundValue, setRefundValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); // Estado para mensagem de sucesso

  const categories = ['Atraso', 'Não gostou', 'Avaria', 'Outros'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const newRefund = {
      order_id: Number(orderNumber),
      category,
      total: parseFloat(refundValue).toFixed(2),
    };

    try {
      const response = await fetch(
        `https://node-vendasnuvemot.onrender.com/refunds/${store}`,
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
      } else {
        setSuccessMessage('Erro ao cadastrar reembolso! ❌');
      }
    } catch (error) {
      setSuccessMessage('Erro na conexão com o servidor. ❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Popup
      open={isPopupOpen}
      onClose={handleIsClosePopup}
      size="xs"
      title="Reembolso"
    >
      <p className="popup-subtitle">Preencha os dados abaixo</p>
      <br />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {successMessage ? (
        <p className="popup-success">{successMessage}</p>
      ) : (
        <form className="popup-form" onSubmit={handleSubmit}>
          <label>Número do pedido:</label>
          <input
            type="number"
            className="popup-input"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            required
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

          <button type="submit" className="popup-button">
            REGISTRAR
          </button>
        </form>
      )}
    </Popup>
  );
}
