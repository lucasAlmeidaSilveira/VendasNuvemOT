import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import Logout from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { TooltipInfo } from '../TooltipInfo';
import { NameUser, Container, Avatar, MenuItem, MenuText } from './styles';
import { Popup } from '../Popup';
import { Converters } from '../Converters';
import { QRCodeGenerator } from '../QRCodeGenerator';

export function User() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [isPopupOpenConverters, setIsPopupOpenConverters] = useState(false);
  const [isPopupOpenQRCodeGenerator, setIsPopupOpenQRCodeGenerator] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleGoToStatus = () => {
    setAnchorEl(null);
    navigate('/status');
  };

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleOpenPopupConverters = () => {
    setIsPopupOpenConverters(true);
    setIsPopupOpenQRCodeGenerator(false);
    setAnchorEl(false);
  };

  const handleOpenPopupQRCodeGenerator = () => {
    setIsPopupOpenConverters(false);
    setIsPopupOpenQRCodeGenerator(true);
    setAnchorEl(false);
  };

  const handleClosePopupConverters = () => {
    setIsPopupOpenConverters(false);
    setIsPopupOpenQRCodeGenerator(false);
    setAnchorEl(false);
  };

  const handleClosePopupQRCodeGenerator = () => {
    setIsPopupOpenConverters(false);
    setIsPopupOpenQRCodeGenerator(false);
    setAnchorEl(false);
  };

  return (
    <Container>
      <TooltipInfo title='Conta'>
        <Avatar className='avatar' onClick={handleClick} src={user?.photoURL} />
      </TooltipInfo>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem>
          <Avatar src={user?.photoURL} />
          <NameUser>{user?.displayName || 'Usuário'}</NameUser>
        </MenuItem>
        <MenuItem>
          <MenuText>{user?.email || 'email@example.com'}</MenuText>
        </MenuItem>
        <MenuItem onClick={handleOpenPopupConverters}>
          <MenuText>Conversor de Mídia</MenuText>
        </MenuItem>
        <MenuItem onClick={handleOpenPopupQRCodeGenerator}>
          <MenuText>Gerador de QRcode</MenuText>
        </MenuItem>
        <MenuItem onClick={handleGoToStatus}>
          <MenuText>Status das plataformas</MenuText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout fontSize='small' />
          Sair
        </MenuItem>
      </Menu>

      <Popup
        open={isPopupOpenConverters}
        onClose={handleClosePopupConverters}
        title='Conversor de mídia'
        size='sm'
      >
        <Converters />
        <br />
        {/* <ConvertVideo /> */}
      </Popup>

      <Popup
        open={isPopupOpenQRCodeGenerator}
        onClose={handleClosePopupQRCodeGenerator}
        title='Gerador de QRcode'
        size='sm'
      >
        <QRCodeGenerator />
      </Popup>
    </Container>
  );
}
