import React from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton, styled } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { ReactElement } from "react";

interface PopupProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactElement;
  size: 'sm' | 'md' | 'lg' | 'xl' | 'xs';
  /** Classe aplicada ao Paper do Dialog, para estilo específico de um popup. */
  paperClassName?: string;
}

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  color: 'var(--text-primary)',
  fontFamily: 'Poppins, sans-serif',
  fontSize: 'var(--body-heading-h5-font-size)',
  fontWeight: 'var(--body-heading-h5-font-weight)',
}));

export function Popup({ open, onClose, title, children, size, paperClassName }: PopupProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={size}
      fullWidth
      PaperProps={paperClassName ? { className: paperClassName } : undefined}
    >
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
