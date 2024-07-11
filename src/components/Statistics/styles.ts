import styled from "styled-components";

interface ContainerGeralProps {
  bgcolor: string;
}

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
  gap: 1.6rem;
  flex-wrap: wrap;
`

const bgColorCard = '#c8e6c9'
const bgColorPix = '#bbdefb'
const bgColorBoleto = '#ffe0b2'
const borderColorCard = '#66bb6a'
const borderColorPix = '#42a5f5'
const borderColorBoleto = '#ffb74d'

export const ContainerGeral = styled.div<ContainerGeralProps>`
  align-items: flex-start;
  display: inline-flex;
  flex-direction: column;
  flex: 1;
  flex-wrap: wrap;
  gap: 1.6rem;
  background-color: ${props => props.bgcolor || 'var(var(--geralgray-10)'};
  padding: 2.4rem;
  border-radius: 1.6rem;

  h4 {
    color: var(--geralwhite);
    text-shadow: 0px 2px 4px rgba(0,0,0,0.5);
  }

  .dev {
    font-size: 14px;
    font-weight: 400;
    color: var(--uiwarning-100);
    text-shadow: initial;
  }

  & .row {
    width: 100%;
    flex-wrap: wrap;
    gap: 1.6rem;
  }

  & .div {
    align-items: flex-start;
    background-color: var(--geralgray-10);
    border-radius: 1.6rem;
    box-shadow: 0px 4px 4px #00000040;
    display: flex;
    width: 100%;
    min-width: 28rem;
    flex: 1;
    flex-direction: column;
    gap: 0.8rem;
    padding: 2rem 3.2rem;
  }

  & .title-box {
    display: flex;
    align-items: center;
    gap: 0.4rem;

    span.colorCard {
      width: 8px;
      height: 8px;
      border-radius: 8px;
      background-color: ${bgColorCard};
      border: 4px solid ${borderColorCard};
    }
    span.colorPix {
      width: 8px;
      height: 8px;
      border-radius: 8px;
      background-color: ${bgColorPix};
      border: 4px solid ${borderColorPix};
    }
    span.colorBoleto {
      width: 8px;
      height: 8px;
      border-radius: 8px;
      background-color: ${bgColorBoleto};
      border: 4px solid ${borderColorBoleto};
    }
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
    display: flex;
    gap: .4rem;
  }
`

export const ContainerCharts = styled.div`
  display: flex;
  width: 100%;
  flex-wrap: wrap;
  gap: 1.6rem;
`

export const Small = styled.span`
  line-height: initial;
  font-size: 1.4rem;
  font-weight: 400;
`