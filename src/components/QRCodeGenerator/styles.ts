import {styled} from 'styled-components';

export const Container = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--chart-tooltip-border);
  background-color: var(--surface);
  color: var(--text-primary);
  margin-bottom: 1rem;
  font-size: 1rem;
  transition: border-color 0.2s;

  &:focus {
    border-color: var(--border-strong);
    outline: none;
  }
`;

export const ImageUploadLabel = styled.label`
  width: 100%;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: 2px dashed var(--chart-tooltip-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--chart-axis);

  &:hover {
    border-color: var(--uiblue-100);
    background-color: var(--surface-2);
    color: var(--uiblue-100);
  }

  span {
    font-size: 0.9rem;
  }
`;

export const ImagePreview = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid var(--surface-3);
`;

export const RemoveImageButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  background-color: #ff4444;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: #cc0000;
    transform: scale(1.1);
  }
`;

export const QRImage = styled.img`
  width: 260px;
  height: 260px;
  /* o QR precisa de fundo claro para ser lido, nos dois temas */
  background: #fcfafb;
  border-radius: 8px;
  box-shadow: 0px 2px 4px var(--shadow-color);
`;

export const DownloadLink = styled.a`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.8rem;
  color: var(--uiblue-100);
  font-weight: 600;
  text-decoration: none;
  font-size: 1.4rem;

  &:hover {
    text-decoration: underline;
  }

  span {
    display: flex;
    align-items: center;
  }
`;