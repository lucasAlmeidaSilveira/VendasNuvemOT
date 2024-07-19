/* eslint-disable react/prop-types */
import { Oval } from 'react-loader-spinner';
import { ContainerLoading } from './styles';

export function Loading({ color }) {
  return (
    <ContainerLoading>
      Carregando...
      <Oval
        height={32}
        width={24}
        color={color}
        wrapperStyle={{}}
        wrapperClass=''
        visible={true}
        ariaLabel='oval-loading'
        secondaryColor={color}
        strokeWidth={4}
        strokeWidthSecondary={4}
      />
    </ContainerLoading>
  );
}

export function LoadingIcon({ color, size }) {
  return (
    <Oval
      height={size}
      width={size}
      color={color}
      wrapperStyle={{}}
      wrapperClass=''
      visible={true}
      ariaLabel='oval-loading'
      secondaryColor={color}
      strokeWidth={4}
      strokeWidthSecondary={4}
    />
  );
}
