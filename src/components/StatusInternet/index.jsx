import { Alert, Snackbar } from '@mui/material';
import React, { useEffect, useState } from 'react';

export function StatusInternet() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

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
