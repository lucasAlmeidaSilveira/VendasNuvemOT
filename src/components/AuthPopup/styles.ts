import styled from 'styled-components';

export const PopupAuth = styled.div`
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

export const Box = styled.div`
  margin: 0 auto;
  max-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 2.4rem;
  border-radius: 0.8rem;
  padding: 4rem 3.2rem;
  background-color: var(--geralblack-100);
  
  div {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: .8rem;

    .row {
      flex-direction: row;
    }
  }
  
  h2 {
    color: var(--geralwhite);
    font-size: 3.2rem;
    font-weight: 700;
    line-height: 120%;
    text-align: center;
  }
  
  p {
    color: var(--geralwhite);
    font-size: 14px;
    text-align: center;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 100px;
    gap: 1.6rem;
    padding: 10px 20px;
    background-color: var(--geralwhite);
    color: var(--geralblack-100);
    box-shadow: 0px 2px 2px #00000040;
    cursor: pointer;
    font-size: 16px;
    transition: background .2s ease;
    
    &:hover {
      background: var(--geralblack-70);
      color: var(--geralwhite);
    }
  }
`;


export const BoxRight = styled.div`
  gap: .8rem;
  align-items: center;
`

export const BoxUser = styled.div`
  align-items: center;
  justify-content: center;
  gap: .8rem;

  img {
    border-radius: 100%;
    width: 4rem;
    height: 4rem;
    image-rendering: optimizeSpeed;
    border: 2px solid var(--geralwhite);
  }

  p {
    color: var(--geralwhite);
    font-size: 1.4rem;
  }
`