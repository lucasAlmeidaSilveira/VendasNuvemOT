import React, { ReactElement, ReactNode } from 'react';
import Tooltip from '@mui/material/Tooltip';
import Zoom from '@mui/material/Zoom';

interface TooltipInfoProps {
  title?: string;
  children: ReactElement;
  className?: string;
}

export function TooltipInfo({ children, title, ...props }: TooltipInfoProps) {
  return (
    <Tooltip
      TransitionComponent={Zoom}
      style={{cursor: 'pointer', display: 'flex', alignItems: 'center'}}
      title={<span style={{ fontSize: 12 }}>{title}</span>}
      disableFocusListener
      followCursor
      {...props}
    >
      <span>
        {children}
      </span>
    </Tooltip>
  );
}
