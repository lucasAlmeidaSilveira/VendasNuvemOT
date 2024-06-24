import styled from 'styled-components';

export const ContainerVariation = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: .8rem 1.6rem;
  gap: .8rem;
  transition: background-color 0.2s ease-in-out;

  &:nth-child(even) {
    background: var(--geralgray-10);
  }
  &:nth-child(odd) {
    background: var(--geralwhite);
  }

  p {
    color: var(--geralblack-100);
  }

  .variation {
    align-items: center;
    display: flex;
    gap: .8rem;

    .info-product {
      align-items: flex-start;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .name-product {
        color: var(--geralblack-100);
        word-wrap: break-word;
        font-weight: 700;
        font-size: 1.2rem;
      }

      .text-position {
        color: var(--geralblack-100);
        font-size: 1.2rem;
      }
    }
  }

  .sales {
    font-size: 1.4rem;
  }
`;
