import { ButtonStyled } from "./styles";

export function Button({typeStyle, onClick, children, ...props}) {
  return(
    <ButtonStyled className={typeStyle} onClick={onClick}  {...props}>
      {children}
    </ButtonStyled>
  )
}