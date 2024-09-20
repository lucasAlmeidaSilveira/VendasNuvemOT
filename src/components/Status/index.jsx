import React, { useEffect, useState } from 'react';
import { PiCheckCircleBold, PiWarningCircleBold } from 'react-icons/pi';
import { MdOutlineAccessTimeFilled } from 'react-icons/md';
import { TooltipInfo } from '../TooltipInfo';
import {
  ContainerStatusData,
  ContainerStatusDataSuccess,
  ContainerStatusDataWait,
  ContainerStatusInitialData,
} from './styles';
import { useOrders } from '../../context/OrdersContext';

export function StatusUpdate({ isLoadingAllOrders, timeDifference }) {
  const { isOnline } = useOrders();

  if (!isOnline) {
    return (
      <TooltipInfo title={'Reconecte-se para acessar os dados'}>
        <ContainerStatusInitialData>
          <PiWarningCircleBold size={16} />
          {'Sem conexão com a internet...'}
        </ContainerStatusInitialData>
      </TooltipInfo>
    );
  }

  // if(error.message === 'Failed to fetch' && error.type === 'server_offline') {
  //   return (
  //     <TooltipInfo title={'Tente novamente em instantes...'}>
  //       <ContainerStatusInitialData>
  //         <PiWarningCircleBold size={16} />
  //         {'Reiniciando servidor...'}
  //       </ContainerStatusInitialData>
  //     </TooltipInfo>
  //   );
  // }

  if (isLoadingAllOrders) {
    return (
      <TooltipInfo title={'Sincronizando dados...'}>
        <ContainerStatusData>
          <PiWarningCircleBold size={16} />
          Atualizando dados...
        </ContainerStatusData>
      </TooltipInfo>
    );
  }

  if (timeDifference === '0 minutos') {
    return (
      <TooltipInfo title={'Os dados estão atualizados.'}>
        <ContainerStatusDataSuccess>
          <PiCheckCircleBold size={16} />
          Atualizado agora mesmo
        </ContainerStatusDataSuccess>
      </TooltipInfo>
    );
  }

  return (
    <TooltipInfo title={'Os dados estão atualizados.'}>
      <ContainerStatusDataWait>
        <MdOutlineAccessTimeFilled size={16} />
        Atualizado há {timeDifference}
      </ContainerStatusDataWait>
    </TooltipInfo>
  );
}
