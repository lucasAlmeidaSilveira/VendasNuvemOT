import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReactElement } from "react";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactElement;
}

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: 'var(--geralblack-100)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: 'var(--body-heading-h5-font-size)',
  fontWeight: 'var(--body-heading-h5-font-weight)',
}));

export function Popup({ open, onClose, title, children }: PopupProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      {title && (
        <StyledDialogTitle>
          {title}
          <IconButton
            aria-label='close'
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: theme => theme.palette.grey[800],
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>
      )}
      <DialogContent dividers>{children}</DialogContent>
    </Dialog>
  );
}
