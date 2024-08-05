import React from 'react';
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  styled,
} from '@mui/material';
import { Button } from '../Button';
import { LoadingIcon } from '../Loading';
import { PiCheckCircleBold } from 'react-icons/pi';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': {
    padding: '1rem',
  }
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: 'var(--geralblack-100)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: 'var(--body-heading-h5-font-size)',
  fontWeight: 'var(--body-heading-h5-font-weight)',
}));

const StyledDialogContentText = styled(DialogContentText)(({ theme }) => ({
  color: 'var(--geralblack-100)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '1.2rem',
  fontWeight: 'var(--body-small-regular-font-weight)',
}));

export function ConfirmationDialog({ open, onClose, onConfirm, loading, success }) {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <StyledDialogTitle id='alert-dialog-title'>
        Confirmação de Cadastro
      </StyledDialogTitle>
      <DialogContent>
        <StyledDialogContentText id='alert-dialog-description'>
          Você tem certeza de que deseja cadastrar este produto?
        </StyledDialogContentText>
      </DialogContent>
      <DialogActions>
        <Button typeStyle={'simple'} onClick={onClose} type='button'>
          Cancelar
        </Button>
        <Button typeStyle={'confirm'} onClick={onConfirm} type='button'>
        {loading ? (
            success ? (
              <PiCheckCircleBold size={20} />
            ) : (
              <LoadingIcon size={20} color={'var(--geralwhite'} />
            )
          ) : (
            'Confirmar'
          )}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}
