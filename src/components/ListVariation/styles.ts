import styled from "styled-components";

export const Container = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 1.6rem 2.4rem;
  gap: 1.6rem;
  transition: background-color .2s ease-in-out;

  &:hover {
    background-color: var(--geralwhite);
  }
  
  p {
    color: var(--geralblack-100);
  }

  .frame {
    align-items: center;
    display: flex;
    gap: 1.6rem;

    .image-product {
      height: 4.8rem;
      width: 4.8rem;
      border-radius: .8rem;
    }

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
`