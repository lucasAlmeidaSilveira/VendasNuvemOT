import React from 'react';
import Tab from '@mui/material/Tab';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import { useTab } from '../../context/TabContext';
import { styled } from '@mui/material/styles';

const TabItem = styled(Tab)(({ theme }) => ({
  flex: 1,
  maxWidth: 'initial',
  fontWeight: 700,
  fontSize: '12px',
  borderRadius: '8px',
  fontFamily: "'Poppins', sans-serif",
  '&:hover::before': {
    backgroundColor: 'rgba(0 0 0 / 0.04)',
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    left: '-1rem',
    right: '-1rem',
    height: '100%',
  },
  [theme.breakpoints.up('md')]: {
    minWidth: 0,
  },
  '&:focus': {
    outline: 'none',
  }
}));

export function Footer() {
  const { activeTab, handleTabChange } = useTab();

  return (
    <Tabs
      sx={{
        [`& .${tabsClasses.indicator}`]: {
          height: 3,
          borderTopLeftRadius: '3px',
          borderTopRightRadius: '3px',
        },
        borderRadius: '8px',
        marginBottom: '24px',
        display: 'flex',
        width: '100%',
      }}
      value={activeTab}
      onChange={handleTabChange}
      aria-label='Menu Relatório'
    >
      <TabItem icon={<AttachMoneyIcon fontSize='large' />} label='VENDAS' />
      <TabItem icon={<EqualizerIcon />} label='MÉTRICAS' />
      <TabItem icon={<ConfirmationNumberIcon />} label='CUPONS' />
    </Tabs>
  );
}
