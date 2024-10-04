/* eslint-disable react/prop-types */
import React from "react";
import { Skeleton } from '@mui/material';

interface LoadingProps {
  bgColor?: string;
}

export function Loading({ bgColor }: LoadingProps) {
  return (
    <Skeleton
      variant='rectangular'
      width={'100%'}
      height={40}
      sx={{
        bgcolor: bgColor
      }}
    />
  );
}