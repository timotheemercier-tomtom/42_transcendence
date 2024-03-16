import React from 'react';
import { experimentalStyled as styled } from '@mui/material/styles';
import MuiButton, { ButtonProps } from '@mui/material/Button';
import { TextField } from '@mui/material';

const ButtonRoot = styled(MuiButton)(({ theme, size }) => ({
  borderRadius: 0,
  fontWeight: theme.typography.fontWeightMedium,
  fontFamily: theme.typography.h1.fontFamily,
  padding: theme.spacing(2, 4),
  fontSize: theme.typography.pxToRem(14),
  boxShadow: 'none',
  '&:active, &:focus': {
    boxShadow: 'none',
  },
  ...(size === 'small' && {
    padding: theme.spacing(1, 3),
    fontSize: theme.typography.pxToRem(13),
  }),
  ...(size === 'large' && {
    padding: theme.spacing(2, 5),
    fontSize: theme.typography.pxToRem(16),
  }),
}));

export default function Button<C extends React.ElementType>(
  props: ButtonProps<C, { component?: C }>,
) {
  return <ButtonRoot {...props} />;
}

export const CustomButton: React.FC<{ label: string; onClick: () => void }> = ({
  label,
  onClick,
}) => {
  return <Button onClick={onClick}>{label}</Button>;
};

export const CustomTextField: React.FC<{
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, value, onChange }) => {
  return <TextField label={label} value={value} onChange={onChange} />;
};
