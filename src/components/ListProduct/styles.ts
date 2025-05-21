import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 100%;
  padding: 0.8rem 1.4rem;
  gap: 0.4rem;
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

  .frame {
    align-items: center;
    display: flex;
    gap: 1.2rem;
    
    .image-product {
      height: 4.8rem;
      width: 4.8rem;
      border-radius: 0.4rem;
    }
    
    .info-product {
      align-items: flex-start;
      width: 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;

      .name-product {
        color: var(--geralblack-100);
        word-wrap: break-word;
        font-weight: 600;
        font-size: 1.2rem;
      }

      .text-position {
        color: var(--geralblack-100);
        font-size: 1.2rem;
      }

      .text-variant {
        font-size: 1rem;
      }
    }

    .sales-container {
      display: flex;
      width: 100%;
      align-items: center;
      justify-content: space-between;
      font-size: 1.2rem;

      .text-sales {
        margin-top: 0.2rem;
      }
      .sales {
      }
    }
  }
`;
