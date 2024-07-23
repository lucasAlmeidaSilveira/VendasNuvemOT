import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  select {
    border-radius: 1.2rem;
    max-width: 200px;
    padding: .8rem 1.6rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.6rem;
    
    background-color: var(--geralwhite);
    border: none;
    box-shadow: 0px 1px 4px rgba(0,0,0,0.25);
  }
`