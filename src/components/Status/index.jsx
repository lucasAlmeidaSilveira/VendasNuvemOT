import { PiCheckCircleBold, PiWarningCircleBold } from "react-icons/pi";
import { ContainerStatusData, ContainerStatusDataSuccess, ContainerStatusDataWait, ContainerStatusInitialData } from "./styles";
import { MdOutlineAccessTimeFilled } from "react-icons/md";
import { TooltipInfo } from '../TooltipInfo';

export function StatusDataLoading({ text, tooltip }) {
  return (
    <TooltipInfo title={tooltip}>
      <ContainerStatusData>
        <PiWarningCircleBold size={16} />
        {text}
      </ContainerStatusData>
    </TooltipInfo>
  );
}

export function StatusInitialDataLoading({ text, tooltip }) {
  return (
    <TooltipInfo title={tooltip}>
      <ContainerStatusInitialData>
        <PiWarningCircleBold size={16} />
        {text}
      </ContainerStatusInitialData>
    </TooltipInfo>
  );
}

export function StatusDataSuccess({ text, tooltip }) {
  return (
    <TooltipInfo title={tooltip}>
      <ContainerStatusDataSuccess>
        <PiCheckCircleBold size={16} />
        {text}
      </ContainerStatusDataSuccess>
    </TooltipInfo>
  );
}

export function StatusDataWait({ text, tooltip }) {
  return (
    <TooltipInfo title={tooltip}>
      <ContainerStatusDataWait>
        <MdOutlineAccessTimeFilled size={16} />
        {text}
      </ContainerStatusDataWait>
    </TooltipInfo>
  );
}