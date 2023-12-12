import styled from "styled-components";

export const Container = styled.div`
  align-items: flex-start;
  flex-direction: column;
  display: flex;
  gap: 2rem;
  margin-top: 2rem;

  .header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: 1;
    gap: 2rem;
  }
`
export const ContainerBestSellers = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 6rem;
  flex-wrap: wrap; 
`

export const ContainerBestSeller = styled.div`
  align-items: flex-start;
  display: flex;
  flex-direction: column;
  min-width: 40rem;
  flex: 1;
  box-shadow: 0px 4px 4px #00000040;
  border-radius: 1.6rem;

  .loading {
    align-self: center;
    padding: 1.6rem;

    div {
      font-size: 1.6rem
    }
  }

  .header {
    align-items: center;
    background: var(--geralblack-100);
    border-radius: 1.6rem 1.6rem 0 0;
    display: flex;
    flex: 0 0 auto;
    justify-content: space-between;
    padding: 1.6rem 2.4rem;
    width: 100%;
    color: var(--geralwhite);

    .categorie {
      width: fit-content;
    }

    .sales-cetegorie{
      font-size: 1.6rem;
    }
  }
  
  .table {
    align-items: flex-start;
    background: var(--geralgray-10);
    border-radius: 0 0 1.6rem 1.6rem;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    justify-content: center;
    width: 100%;
  }
`