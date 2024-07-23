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
    background-color: var(--geralwhite);
    border: none;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  }

  .calendar-view {
    border-radius: 1.2rem;
    border: none;
    background-color: #fcfafb;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);

    button {
      font-size: 1rem;
      font-family: 'Poppins', sans-serif;
      color: var(--geralblack-100);

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
    background-color: var(--geralwhite);
    border: none;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  }

  .calendar-view {
    border-radius: 1.2rem;
    border: none;
    background-color: #fcfafb;
    box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);

    button {
      font-size: 1rem;
      font-family: 'Poppins', sans-serif;
      color: var(--geralblack-100);

      span {
        font-size: 1.4rem;
        text-transform: uppercase;
      }
    }
  }
`;
