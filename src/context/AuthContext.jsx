import React, { createContext, useState, useEffect, useContext } from 'react';
import {
  auth,
  provider,
  signInWithPopup,
  signOut,
} from '../api/auth/firebaseConfig.js';
import { getFirestore, doc, getDoc } from 'firebase/firestore'; // Importar Firestore

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializa o Firestore
  const db = getFirestore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        // Função para verificar se o e-mail está permitido no Firestore
        const checkEmailAllowed = async (email) => {
          try {
            const docRef = doc(db, 'allowedEmails', email);
            const docSnap = await getDoc(docRef);
            return docSnap.exists(); // Retorna true se o e-mail estiver no Firestore
          } catch (error) {
            console.error('Erro ao verificar e-mail no Firestore:', error);
            return false;
          }
        };

        // Verifica se o e-mail do usuário está na coleção 'allowedEmails'
        const isAllowed = await checkEmailAllowed(user.email);

        if (isAllowed) {
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
  }, [db]); // db é a dependência do Firestore

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
    handleLogout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}{' '}
      {/* Carrega os children somente quando o loading estiver completo */}
    </AuthContext.Provider>
  );
};
