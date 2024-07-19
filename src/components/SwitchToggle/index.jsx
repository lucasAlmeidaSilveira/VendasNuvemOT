import * as React from 'react';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';

const Toggle = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))({
  width: 42,
  height: 26,
  padding: 0,
  '& .MuiSwitch-switchBase': {
    padding: 0,
    margin: 2,
    transitionDuration: '300ms',
    '&.Mui-checked': {
      transform: 'translateX(16px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        backgroundColor: 'var(--uiblue-100)',
        opacity: 1,
        border: 0,
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxSizing: 'border-box',
    width: 22,
    height: 22,
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
    backgroundColor: 'var(--geralblack-50)',
    opacity: 1,
    transition: 'background-color 500ms',
  },
});

export function SwitchToggle({ checked, onChange, name }) {
  return (
    <FormControlLabel
      control={<Toggle checked={checked} onChange={onChange} name={name} sx={{ m: 1 }} />}
      label={<span className='label--switch-toggle'>Atualização automática</span>}
      labelPlacement="start"
    />
  );
}
