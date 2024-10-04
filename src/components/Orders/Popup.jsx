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
import { Loading } from '../Loading';
import { PiCheckCircleBold } from 'react-icons/pi';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .css-1t1j96h-MuiPaper-root-MuiDialog-paper': {
    padding: '1rem',
  }
}));

const StyledDialogTitle = styled(DialogTitle)({
  fontFamily: "'Poppins', sans-serif",
  fontSize: '2rem',
  fontWeight: '600',
})

const StyledDialogContentText = styled(DialogContentText)(({ theme }) => ({
  color: 'var(--geralblack-100)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: '1.2rem',
  fontWeight: 'var(--body-small-regular-font-weight)',
}));

export function ConfirmDeletePopup({ open, onClose, onConfirm, loading, success, action }) {
  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby='alert-dialog-title'
      aria-describedby='alert-dialog-description'
    >
      <StyledDialogTitle id='alert-dialog-title'>
        Confirmar ação?
      </StyledDialogTitle>
      <DialogContent>
        <StyledDialogContentText id='alert-dialog-description'>
          Você tem certeza {action}?
        </StyledDialogContentText>
      </DialogContent>
      <DialogActions>
        <Button typeStyle={'simple'} onClick={onClose} type='button'>
          Cancelar
        </Button>
        <Button typeStyle={'delete'} onClick={onConfirm} type='button'>
          {loading ? (
            success ? (
              <PiCheckCircleBold size={20} />
            ) : (
              <Loading />
            )
          ) : (
            {action}
          )}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
}

