import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import Divider from '@mui/material/Divider';
import Logout from '@mui/icons-material/Logout';
import { useAuth } from '../../context/AuthContext';
import { TooltipInfo } from '../TooltipInfo';
import { NameUser, Container, Avatar, MenuItem, MenuText } from './styles';
import { Popup } from '../Popup';
import { Converters } from '../Converters';

export function User() {
  const { user, handleLogout } = useAuth(); // Pegue o usuário e a função de logout do contexto
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = event => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleOpenPopup = () => {
    setIsPopupOpen(true);
    setAnchorEl(false);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
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
        <MenuItem onClick={handleOpenPopup}>
          <MenuText>Conversor de Mídia</MenuText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout}>
          <Logout fontSize='small' />
          Sair
        </MenuItem>
      </Menu>

      <Popup
        open={isPopupOpen}
        onClose={handleClosePopup}
        title='Conversor de mídia'
      >
        <Converters />
        <br />
        {/* <ConvertVideo /> */}
      </Popup>
    </Container>
  );
}
