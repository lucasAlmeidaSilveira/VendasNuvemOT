import styled from "styled-components";

export const ButtonStyled = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: .8rem;
  padding: 8px 16px;
  font-size: 1.2rem;
  background-color: var(--geralblack-100);
  color: var(--geralwhite);
  border: none;
  border-radius: 100px;
  cursor: pointer;
  box-shadow: 0px 1px 4px rgba(0,0,0,0.25);
  
  transition: all .2s ease-in-out;
  
  &:hover {
    background-color: var(--geralblack-80);
    box-shadow: 0px 2px 4px rgba(0,0,0,0.25);
  }

  &.simple {
    background-color: var(--geralblack-20);
    color: var(--geralblack-100);
    width: 100%;
    opacity: 1;

    &:hover {
      opacity: .9;
    }
  }

  &.confirm {
    background-color: var(--geralblack-100);
    color: var(--geralwhite);
    width: 100%;
    opacity: 1;

    &:hover {
      opacity: .9;
    }
  }
`