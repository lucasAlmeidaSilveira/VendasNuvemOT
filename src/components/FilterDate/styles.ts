import { styled } from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  .calendar {
    flex: 1;
  }

  .react-date-picker__wrapper {
    border-radius: 1.2rem;
    max-width: 200px;
    padding: .8rem 1.6rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.6rem;
    
    background-color: #f1f0f2;
    border: none;
    box-shadow: 0px 2px 4px rgba(0,0,0,0.25);
  }
  
  .calendar-view {
    border-radius: 1.2rem;
    border: none;
    background-color: #FCFAFB;
    box-shadow: 0px 2px 4px rgba(0,0,0,0.25);
    
    button {
      font-size: 1rem;
      font-family: 'Poppins', sans-serif;
      color: #1F1F1F;
      
      span {
        font-size: 1.4rem;
        text-transform: uppercase;
      }
    }
  }
`
