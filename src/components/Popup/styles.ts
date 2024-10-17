import styled from 'styled-components';

export const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(10px); /* Intensidade do desfoque */
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  z-index: 1000000;
`;