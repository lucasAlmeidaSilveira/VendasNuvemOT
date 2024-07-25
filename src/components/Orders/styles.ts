import styled, { css } from 'styled-components';

export const ContainerOrder = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
  border-radius: 8px;
  overflow-x: auto; /* Adicionado para rolagem horizontal */
  width: 100%; /* Garantir que o contêiner ocupe toda a largura disponível */

  & > div {
    width: 100% !important;
  }

  a.link {
    display: flex;
    align-items: center;
    gap: .4rem;
    text-decoration: none;
    cursor: pointer;
  }
  
  a.link-gateway {
    font-size: 12px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  table {
    min-width: 280px; /* Definir largura mínima para tabela */
  }
`;

export const FilterContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: 1.6rem;
  margin-bottom: 20px;

  p.results {
    font-size: 12px;
  }

  label.check--use-partner {
    display: flex;
    align-items: center;
    gap: .2rem;
    font-size: 12px;
  }
  .last-updated{
    font-size: 1.2rem;
    color: var(--geralblack-100);
  }

`;

export const Selects = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  flex-wrap: wrap;
  gap: .8rem;

  div {
    display: flex;
    align-items: flex-start;
  }
`

interface FilterButtonProps {
  active?: string;
}

export const FilterButton = styled.button<FilterButtonProps>`
  border-radius: 0.8rem;
  padding: 0.2rem 1rem;
  margin-left: 0.8rem;
  height: fit-content;
  font-size: 1.2rem;
  cursor: pointer;
  background-color: #f1f0f2;
  opacity: 0.9;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.25);
  transition: all 0.1s ease-in;

  &:hover {
    opacity: 1;
    box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.25);
  }

  ${({ active }) =>
    active &&
    css`
      background-color: var(--geralblack-100);
      color: #fcfafb;
    `}
`;

interface PaymentStatusContainerProps {
  backgroundColor: string;
  borderColor: string;
}

export const PaymentStatusContainer = styled.div<PaymentStatusContainerProps>`
  display: flex;
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border: 1px solid ${({ borderColor }) => borderColor};
  border-radius: 12px;
  padding: 4px 8px;
  width: fit-content;
  font-size: 12px;
  margin-bottom: 4px;

  span {
    color: ${({ borderColor }) => borderColor};
    font-weight: 600;
  }
  
  svg {
    color: ${({ borderColor }) => borderColor};
    margin-right: 4px;
  }
`;

interface ShippingStatusContainerProps {
  backgroundColor: string;
  borderColor: string;
}

export const ShippingStatusContainer = styled.div<ShippingStatusContainerProps>`
  display: flex;
  align-items: center;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border: 1px solid ${({ borderColor }) => borderColor};
  border-radius: 12px;
  padding: 4px 8px;
  width: fit-content;
  font-size: 12px;
  
  span {
    color: ${({ borderColor }) => borderColor};
    font-weight: 600;
  }
  
  svg {
    color: ${({ borderColor }) => borderColor};
    font-size: 16px;
    margin-right: 4px;
  }
`;

export const ProductDetailsContainer = styled.div`
display: flex;
flex-direction: column;
padding: 1rem;
border-top: 1px solid #ddd;
`;

export const ProductRow = styled.div`
display: flex;
align-items: center;
padding: 0.5rem 0;

img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  margin-right: 1rem;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  word-break: break-word;
}

.product-sku {
  width: 120px;
  text-align: right;
}

.product-quantity,
.product-price {
  width: 80px;
  text-align: right;
}
`;

export const StatusFilterContainer = styled.div`
  display: flex;
  flex: 1;
  
  gap: 1.6rem;
  margin-bottom: 2.4rem;

  .status-filter {
    align-items: flex-start;
    padding: 2rem 3.2rem;
    background-color: var(--geralgray-10);
    border-radius: 1.6rem;
    box-shadow: 0px 4px 4px #00000040;
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 0.8rem;
    cursor: pointer;
    transition: background 0.3s;

    &:hover {
      background: #e0e0e0;
    }

    &.active {
      background: var(--geralblack-100);
      span {
        color: var(--geralwhite) !important;
      }
    }

    span {
      &:first-child {
        color: var(--geralblack-100);
        font-family: var(--body-paragraph-regular-font-family);
        font-size: var(--body-paragraph-regular-font-size);
        font-style: var(--body-paragraph-regular-font-style);
        font-weight: var(--body-paragraph-regular-font-weight);
        letter-spacing: var(--body-paragraph-regular-letter-spacing);
        line-height: var(--body-paragraph-regular-line-height);
        margin-top: -1px;
        white-space: nowrap;
      }

      &:last-child {
        color: var(--geralblack-100);
        font-family: var(--body-heading-h4-font-family);
        font-size: var(--body-heading-h4-font-size);
        font-style: var(--body-heading-h4-font-style);
        font-weight: var(--body-heading-h4-font-weight);
        letter-spacing: var(--body-heading-h4-letter-spacing);
        line-height: var(--body-heading-h4-line-height);
        white-space: nowrap;
      }
    }
  }
`;

export const ContainerDetails = styled.div`
  margin-top: 2.4rem;
  display: flex;
  flex-direction: column;
  gap: 1.6rem;
`