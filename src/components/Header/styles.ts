import styled from "styled-components";

export const Container = styled.div`
  align-items: center;
  justify-content: space-between;
  background-color: var(--geralblack-100);
  border-radius: 16px;
  display: flex;
  gap: 8px;
  padding: 2rem 2rem;
  margin-bottom: 80px;
  box-shadow: 0px 2px 2px #00000040;
  position: sticky;
  top: 2rem;
  z-index: 999;

  img {
    flex: 1;
  }

  div {
    flex: 1;
    display: flex;
  }

  .div {
    align-items: center;
    gap: 1rem;
  }

  .div-2 {
    align-items: flex-start;
    flex-direction: column;
    gap: 2px;
  }

  .text-wrapper {
    color: #ffffff;
    font-family: var(--body-paragraph-regular-font-family);
    font-size: 1.4rem;
    font-style: var(--body-paragraph-regular-font-style);
    font-weight: var(--body-paragraph-regular-font-weight);
    letter-spacing: var(--body-paragraph-regular-letter-spacing);
    line-height: var(--body-paragraph-regular-line-height);
    margin-top: -1px;
    white-space: nowrap;
    width: fit-content;
  }

  .text-wrapper-2, .store-select {
    color: #ffffff;
    font-family: var(--body-heading-h6-font-family);
    font-size: 1.6rem;
    font-style: var(--body-heading-h6-font-style);
    font-weight: var(--body-heading-h6-font-weight);
    letter-spacing: var(--body-heading-h6-letter-spacing);
    line-height: var(--body-heading-h6-line-height);
    width: fit-content;
  }

  select {
    border: none;
    padding: 0;
    background-color: transparent;

    option{
      color: var(--geralblack-100);
    }
  }

  .vector-wrapper {
    align-items: center;
    background-color: var(--geralwhite);
    border-radius: 100px;
    box-shadow: 0px 4px 4px #00000040;
    display: flex;
    flex-direction: column;
    gap: 8px;
    height: 56px;
    justify-content: space-around;
    padding: 0px 10px;
    width: 56px;
  }

  .vector {
    height: 29.09px;
    margin-left: -2px;
    margin-right: -2px;
    width: 40px;
  }
`