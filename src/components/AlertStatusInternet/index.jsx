import { Alert, Snackbar } from '@mui/material';
import React from 'react';
import { useOrders } from '../../context/OrdersContext';

export function AlertStatusInternet() {
  const { isOnline } = useOrders();

  return (
    <Snackbar open={!isOnline} autoHideDuration={5000}>
      <Alert
        severity='error'
        variant='filled'
        sx={{
          width: '100%',
          fontSize: '1.4rem',
          lineHeight: '150%',
          fontWeight: 600,
        }}
      >
        Sem conexão com a internet...
      </Alert>
    </Snackbar>
  );
}
