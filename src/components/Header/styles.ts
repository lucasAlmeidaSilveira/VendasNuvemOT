import styled from "styled-components";

export const Container = styled.div`
  align-items: center;
  justify-content: space-between;
  background-color: var(--geralblack-100);
  border-radius: 16px;
  display: flex;
  gap: 8px;
  padding: 2rem 3rem;
  margin-bottom: 80px;

  & .div {
    align-items: center;
    display: inline-flex;
    flex: 0 0 auto;
    gap: 1rem;
  }

  & .div-2 {
    align-items: flex-start;
    display: inline-flex;
    flex: 0 0 auto;
    flex-direction: column;
    gap: 2px;
    justify-content: center;
  }

  & .text-wrapper {
    color: #ffffff;
    font-family: var(--body-paragraph-regular-font-family);
    font-size: var(--body-paragraph-regular-font-size);
    font-style: var(--body-paragraph-regular-font-style);
    font-weight: var(--body-paragraph-regular-font-weight);
    letter-spacing: var(--body-paragraph-regular-letter-spacing);
    line-height: var(--body-paragraph-regular-line-height);
    margin-top: -1px;
    white-space: nowrap;
    width: fit-content;
  }

  & .text-wrapper-2 {
    color: #ffffff;
    font-family: var(--body-heading-h6-font-family);
    font-size: var(--body-heading-h6-font-size);
    font-style: var(--body-heading-h6-font-style);
    font-weight: var(--body-heading-h6-font-weight);
    letter-spacing: var(--body-heading-h6-letter-spacing);
    line-height: var(--body-heading-h6-line-height);
    white-space: nowrap;
    width: fit-content;
  }

  & .vector-wrapper {
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

  & .vector {
    height: 29.09px;
    margin-left: -2px;
    margin-right: -2px;
    width: 40px;
  }
`