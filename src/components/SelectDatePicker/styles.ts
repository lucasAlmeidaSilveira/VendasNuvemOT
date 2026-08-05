import { styled } from 'styled-components';

export const ContainerDatePickerIcon = styled.div`
  .react-date-picker__inputGroup {
    display: none;
  }

  .react-date-picker__wrapper {
    border-radius: 1.2rem;
    max-width: 200px;
    padding: 0.4rem 0.8rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.2rem;
    background-color: var(--surface);
    color: var(--text-primary);
    border: none;
    box-shadow: 0px 1px 4px var(--shadow-color-soft);
  }

  .calendar-view {
    border-radius: 1.2rem;
    border: none;
    background-color: var(--surface);
    box-shadow: 0px 1px 4px var(--shadow-color-soft);

    button {
      font-size: 1rem;
      font-family: 'Poppins', sans-serif;
      color: var(--text-primary);

      span {
        font-size: 1.4rem;
        text-transform: uppercase;
      }
    }
  }
`;

export const ContainerDatePicker = styled.div`
  .calendar {
    flex: 1;
  }

  .react-date-picker__wrapper {
    border-radius: 1.2rem;
    max-width: 200px;
    padding: 0.4rem 0.8rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.4rem;
    background-color: var(--surface);
    color: var(--text-primary);
    border: none;
    box-shadow: 0px 1px 4px var(--shadow-color-soft);
  }

  .calendar-view {
    border-radius: 1.2rem;
    border: none;
    background-color: var(--surface);
    box-shadow: 0px 1px 4px var(--shadow-color-soft);

    button {
      font-size: 1rem;
      font-family: 'Poppins', sans-serif;
      color: var(--text-primary);

      span {
        font-size: 1.4rem;
        text-transform: uppercase;
      }
    }
  }
`;
