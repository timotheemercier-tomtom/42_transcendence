import { Stack, StackProps } from '@mui/material';
import React from 'react';

const Col = ({ children, ...props }: StackProps) => {
  return (
    <Stack direction="column" minHeight={0} {...props}>
      {children}
    </Stack>
  );
};

export default Col;
