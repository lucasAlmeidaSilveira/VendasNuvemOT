/* eslint-disable react/prop-types */
import { Skeleton } from '@mui/material';

export function Loading() {
  return (
    <Skeleton
      variant='rectangular'
      width={'100%'}
      height={40}
      sx={{
        mixBlendMode: 'color-burn', // Modo de mesclagem para ajustar a cor de contraste
      }}
    />
  );
}