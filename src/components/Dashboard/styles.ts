import styled from "styled-components";

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;

  h1 {
    color: var(--geralblack-100);
    font-family: var(--body-heading-h5-font-family);
    font-size: var(--body-heading-h5-font-size);
    font-style: var(--body-heading-h5-font-style);
    font-weight: var(--body-heading-h5-font-weight);
    letter-spacing: var(--body-heading-h5-letter-spacing);
    line-height: var(--body-heading-h5-line-height);
    margin-top: -1px;
    white-space: nowrap;
  }
`

export const ContainerOrders = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: 6rem;
  flex-wrap: wrap;
`

export const ContainerPago = styled.div`
  align-items: flex-start;
  display: inline-flex;
  flex-direction: column;
  gap: 1.6rem;

  & .text-wrapper {
    color: var(--geralblack-100);
    font-family: var(--body-heading-h5-font-family);
    font-size: var(--body-heading-h5-font-size);
    font-style: var(--body-heading-h5-font-style);
    font-weight: var(--body-heading-h5-font-weight);
    letter-spacing: var(--body-heading-h5-letter-spacing);
    line-height: var(--body-heading-h5-line-height);
    margin-top: -1px;
    white-space: nowrap;
  }

  & .div {
    align-items: flex-start;
    background-color: var(--geralblack-100);
    border-radius: 1.6rem;
    box-shadow: 0px 4px 4px #00000040;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 0.8rem;
    padding: 2.4rem 4rem;
  }

  & .text-wrapper-2 {
    color: #ffffff;
    font-family: var(--body-paragraph-regular-font-family);
    font-size: var(--body-paragraph-regular-font-size);
    font-style: var(--body-paragraph-regular-font-style);
    font-weight: var(--body-paragraph-regular-font-weight);
    letter-spacing: var(--body-paragraph-regular-letter-spacing);
    line-height: var(--body-paragraph-regular-line-height);
    margin-top: -1px;
    white-space: nowrap;
  }

  & .text-wrapper-3 {
    color: #ffffff;
    font-family: var(--body-heading-h2-font-family);
    font-size: var(--body-heading-h2-font-size);
    font-style: var(--body-heading-h2-font-style);
    font-weight: var(--body-heading-h2-font-weight);
    letter-spacing: var(--body-heading-h2-letter-spacing);
    line-height: var(--body-heading-h2-line-height);
    white-space: nowrap;
  }
`
export const ContainerGeral = styled.div`
  align-items: flex-start;
  display: inline-flex;
  flex-direction: column;
  gap: 1.6rem;

  & .text-wrapper {
    color: var(--geralblack-100);
    font-family: var(--body-heading-h6-font-family);
    font-size: var(--body-heading-h6-font-size);
    font-style: var(--body-heading-h6-font-style);
    font-weight: var(--body-heading-h6-font-weight);
    letter-spacing: var(--body-heading-h6-letter-spacing);
    line-height: var(--body-heading-h6-line-height);
    margin-top: -1px;
    white-space: nowrap;
  }

  & .div {
    align-items: flex-start;
    background-color: var(--geralgray-10);
    border-radius: 1.6rem;
    box-shadow: 0px 4px 4px #00000040;
    display: flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 0.8rem;
    padding: 2rem 3.2rem;
  }

  & .text-wrapper-2 {
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

  & .text-wrapper-3 {
    color: var(--geralblack-100);
    font-family: var(--body-heading-h4-font-family);
    font-size: var(--body-heading-h4-font-size);
    font-style: var(--body-heading-h4-font-style);
    font-weight: var(--body-heading-h4-font-weight);
    letter-spacing: var(--body-heading-h4-letter-spacing);
    line-height: var(--body-heading-h4-line-height);
    white-space: nowrap;
  }
`