import styled from 'styled-components';

export const Container = styled.div`
  align-items: flex-start;
  flex-direction: column;
  display: flex;
  gap: 2rem;
  margin-top: 2rem;

  .header-container {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex: 1;
    width: 100%;
    gap: 2rem;
  }

  .header--number-products {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    gap: 2rem;

    h1 {
      color: var(--geralblack-100);
      font-size: var(--body-heading-h5-font-size);
      font-weight: var(--body-heading-h5-font-weight);
    }
  }
`;

export const ContainerBestSellers = styled.div`
  align-items: flex-start;
  justify-content: center;
  display: flex;
  gap: 4rem;
  flex-wrap: wrap;
`;

export const ContainerBestSeller = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  min-width: 30rem;
  max-width: 600px;
  flex: 1;
  box-shadow: 0px 4px 4px #00000040;
  border-radius: 1.6rem;

  &.variations {
    width: 30rem;
    flex: initial;
    min-width: initial;
  }

  .loading {
    align-self: center;
    padding: 1.6rem;

    div {
      font-size: 1.6rem;
    }
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--geralblack-100);
    border-radius: 1.6rem 1.6rem 0 0;
    flex: 0 0 auto;
    padding: 1.6rem 2.4rem;
    width: 100%;
    color: var(--geralwhite);

    .categorie {
      width: fit-content;
      font-weight: 600;
    }

    .sales-cetegorie {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      font-size: 1.6rem;
      font-weight: 600;
    }
    .total-sales {
      font-size: 1.4rem;
      font-weight: 300;
    }
  }

  .table {
    align-items: flex-start;
    border-radius: 0 0 1.6rem 1.6rem;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }
`;

export const ContainerProductRegistration = styled.div`
  margin: 0 auto;
  min-width: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.8rem;
`;

export const TitlePage = styled.h1`
  font-family: "Poppins", sans-serif;
  font-size: 2.8rem;
  font-weight: 600;
  line-height: 120%;
`

export const Label = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--geralblack-100);
`;

export const ContainerButton = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.8rem;

  &.codImage {
    flex: .4;
  }
`;

export const ContainerButtonRow = styled.div`
  display: flex;
  width: 100%;
  gap: 1.6rem;
`;

export const ContainerForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`;

export const ContainerSelect = styled.div`
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