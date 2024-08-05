import React, { useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  styled,
} from '@mui/material';
import { Button } from '../Button';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': {
    padding: '1rem',
  },
  '& .css-ypiqx9-MuiDialogContent-root': {
    overflowY: 'initial',
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: 'var(--geralblack-100)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: 'var(--body-heading-h6-font-size)',
  fontWeight: 'var(--body-heading-h5-font-weight)',
}));

const TextFieldInput = styled(TextField)({
  fontFamily: "'Poppins', sans-serif",
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

export function AuthDialog({ open, onClose, onAuthenticate }) {
  const [securityKey, setSecurityKey] = useState('');
  const [error, setError] = useState('');

  const handleAuthentication = () => {
    const validKey = 'Arte@1259#'; // Substitua pela sua Senha real
    if (securityKey === validKey) {
      localStorage.setItem('authenticated', 'true');
      onAuthenticate();
      onClose();
    } else {
      setError('Senha inválida');
    }
  };

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle>Chave de Autenticação</StyledDialogTitle>
      <DialogContent>
        <TextFieldInput
          type='password'
          label='Senha'
          fullWidth
          value={securityKey}
          onChange={e => setSecurityKey(e.target.value)}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} typeStyle={'simple'} type='button'>
          Cancelar
        </Button>
        <Button
          onClick={handleAuthentication}
          typeStyle={'confirm'}
          type='button'
        >
          Autenticar
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
