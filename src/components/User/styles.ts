import { styled } from 'styled-components';

export const Container = styled.div`
  img.avatar {
    border-radius: 100%;
    width: 4rem;
    height: 4rem;
    image-rendering: optimizeSpeed;
    border: 2px solid var(--geralwhite);
  }
`;

export const NameUser = styled.span`
  font-size: 1.2rem;
`;

export const Avatar = styled.img`
  border-radius: 100%;
  width: 4rem;
  height: 4rem;
  image-rendering: optimizeSpeed;
  border: 2px solid var(--geralwhite);
`;

export const MenuItem = styled.div`
  display: flex;
  align-items: center;
  gap: .8rem;
  padding: .8rem 1.6rem;

  &.logout {
    cursor: pointer;
    transition: background .2s ease-out;

    &:hover {
      background: var(--geralblack-20);
    }
  }
`

export const MenuText = styled.span`
  font-size: 1rem;
  color: var(--geralblack-70);
`
