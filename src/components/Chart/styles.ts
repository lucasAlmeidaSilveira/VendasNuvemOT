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
  background-color: var(--surface-2);
  border-radius: 1.6rem;
  box-shadow: 0px 4px 4px var(--shadow-color), 0 0 0 1px var(--elevation-border);

  h2 {
    color: var(--text-primary);
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
  background-color: var(--surface-2);
  border-radius: 1.6rem;
  box-shadow: 0px 4px 4px var(--shadow-color), 0 0 0 1px var(--elevation-border);

  div.header {
    h2 {
      color: var(--text-primary);
      display: flex;
      align-items: center;
      font-weight: 600;
      select {
        margin-left: -8px;
        font-size: 1.4rem;
        box-shadow: initial !important;
        font-weight: 600;
        color: var(--text-primary);
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
  background-color: var(--surface-2);
  border-radius: 1.6rem;
  box-shadow: 0px 4px 4px var(--shadow-color), 0 0 0 1px var(--elevation-border);

  div.header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;

    select {
      opacity: .8;
      background: var(--chip-bg);

      option{
        color: var(--chip-text);
      }
    }
  }

  h2 {
    color: var(--text-primary);
    font-weight: 600;
  }
`