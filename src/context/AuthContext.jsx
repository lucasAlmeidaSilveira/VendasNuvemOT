import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, provider, signInWithPopup, signOut } from '../api/auth/firebaseConfig.js'

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        const allowedEmails = [
          'lucas.asilveira.sh@gmail.com',
          'lucasartepropria@gmail.com',
          'glaccorroni@gmail.com',
          'hugo@consultoria.space',
          'thamires@consultoria.space',
          'juliana@consultoria.space',
          'gabrielle@consultoria.space',
          'lucas@galeria9.com.br',
          'paulo.h.artepropria@gmail.com',
          'ranierihernandes@gmail.com',
          'samezimaleticia@gmail.com',
          'hermogenesdj@gmail.com',
          'danielerosepedroso@gmail.com',
          'micjfeltrin@gmail.com',
          'bruna.artepropria@gmail.com',
          'dev@artepropria.com'
        ];
        if (allowedEmails.includes(user.email)) {
          setUser(user);
        } else {
          alert('Você não tem permissão para acessar esta aplicação.');
          handleLogout();
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe(); // Cleanup no unsubscribe do listener
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const value = {
    user,
    isLoading,
    handleLogin,
    handleLogout
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children} {/* Carrega os children somente quando o loading estiver completo */}
    </AuthContext.Provider>
  );
};

