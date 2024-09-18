import React, { ReactElement, ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Fade from '@mui/material/Fade';
import Zoom from '@mui/material/Zoom';

interface TooltipInfoProps {
  title?: string;
  children: ReactElement;
}

export function TooltipInfo({ children, title }: TooltipInfoProps) {
  return (
    <Tooltip
      TransitionComponent={Zoom}
      style={{cursor: 'pointer'}}
      title={<span style={{ fontSize: 12 }}>{title}</span>}
      disableFocusListener
      followCursor
    >
      {children}
    </Tooltip>
  );
}
