import { Stack, StackProps } from '@mui/material';
import React from 'react';

const Row = ({ children, ...props }: StackProps) => {
  return (
    <Stack direction="row" {...props}>
      {children}
    </Stack>
  );
};

export default Row;
