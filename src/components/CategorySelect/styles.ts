import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  select {
    border-radius: 1.2rem;
    max-width: 100px;
    padding: .4rem 1rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.2rem;
    
    background-color: rgba(255, 255, 255, .2);
    color: #FCFAFB;
    border: none;
    box-shadow: 0px 2px 4px rgba(0,0,0,0.25);
    
    option {
      color: #1f1f1f;
    }
  }
`