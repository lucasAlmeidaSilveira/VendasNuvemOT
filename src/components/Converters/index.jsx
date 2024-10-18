import React, { useState } from 'react';
import { Tabs, Tab, Box, styled, tabsClasses } from '@mui/material';
import { ConvertImage } from "./ConvertImage";
import { ConvertVideo } from "./ConvertVideo";
import { FaImage, FaVideo } from 'react-icons/fa6';

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

export function Converters() {
  const [selectedTab, setSelectedTab] = useState(0);

  // Função para alternar as abas
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs */}
      <Tabs 
        value={selectedTab} 
        onChange={handleTabChange} 
        centered
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
      >
        <TabItem icon={<FaImage />} label="Imagem" />
        <TabItem icon={<FaVideo />} label="Vídeo" />
      </Tabs>

      {/* Conteúdo de cada aba */}
      {selectedTab === 0 && (
        <Box sx={{ padding: 2 }}>
          <ConvertImage />
        </Box>
      )}
      {selectedTab === 1 && (
        <Box sx={{ padding: 2 }}>
          <ConvertVideo />
        </Box>
      )}
    </Box>
  );
}