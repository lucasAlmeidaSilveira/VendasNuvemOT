import { styled } from "styled-components";

export const ContainerChartPie = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  flex: 1;
  gap: 1.6rem;
  min-width: 30rem;
  max-width: 40rem;
  align-items: flex-start;
  background-color: var(--geralgray-10);
  border-radius: 1.6rem;
  box-shadow: 0px 4px 4px #00000040;

  h2 {
    color: #1f1f1f;
    font-weight: 600;
  }
`
export const ContainerChartLine = styled.div`
  display: flex;
  flex-direction: column;
  padding: 2rem;
  flex: 1;
  gap: 1.6rem;
  min-width: 30rem;
  align-items: flex-start;
  background-color: var(--geralgray-10);
  border-radius: 1.6rem;
  box-shadow: 0px 4px 4px #00000040;

  div.header {
    h2 {
      color: #1f1f1f;
      display: flex;
      align-items: center;
      font-weight: 600;
      select {
        margin-left: -8px;
        font-size: 1.4rem;
        box-shadow: initial !important;
        font-weight: 600;
        color: #1f1f1f;
        background: transparent;
      }
    }
  }
  
  `

export const ContainerChartStates= styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 2rem;
  flex: 1;
  gap: 4rem;
  min-width: 30rem;
  background-color: var(--geralgray-10);
  border-radius: 1.6rem;
  box-shadow: 0px 4px 4px #00000040;

  div.header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    select {
      opacity: .8;
      background: #1f1f1f;

      option{
        color: #fcfafb;
      }
    }
  }

  h2 {
    color: #1f1f1f;
    font-weight: 600;
  }
`