// src/AuthComponent.js
import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { Box, PopupAuth } from './styles.ts';
import { useAuth } from '../../context/AuthContext.jsx';
import { Logotipo } from '../Logo/index.jsx';

export function AuthPopup() {
  const { user, handleLogin } = useAuth();

  if (!user) {
    return (
      <PopupAuth>
        <Box>
          <div>
            <div className='row'>
              <Logotipo store={'artepropria'} />
              <Logotipo store={'outlet'} />
            </div>
            <h2>Bem vindo ao Vendas Nuvem!</h2>
            <p>
            Dashboard de vendas com dados e métricas dos ecommerces da Arte Própria.
            </p>
          </div>
          <div>
            <p>Faça login com sua conta Google.</p>
            <button onClick={handleLogin}>
              <FcGoogle size={24} />
              Login com o Google
            </button>
          </div>
        </Box>
      </PopupAuth>
    );
  }
}
