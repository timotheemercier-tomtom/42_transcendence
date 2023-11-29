import { Stack, StackProps } from '@mui/material';

const Row = ({ children, ...props }: StackProps) => {
  return (
    <Stack direction="row" {...props}>
      {children}
    </Stack>
  );
};

export default Row;
