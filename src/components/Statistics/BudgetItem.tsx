import React from 'react';
import { Loading } from '../Loading';
import { formatCurrency } from '../../tools/tools';
import { TooltipInfo } from "../TooltipInfo";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { Small } from "./styles";

interface BudgetItemProps {
  icon?: React.ElementType;
  iconColor?: string;
  bullet?: string;
  small?: string | number;
  title: string;
  value: number | string;
  isLoading: boolean;
  tooltip?: string;
}

export function BudgetItem ({ icon: Icon, iconColor, bullet, title, tooltip, value, isLoading, small }: BudgetItemProps) {
  
  return (
    <div className='div'>
    <div className='title-box'>
      {Icon && <Icon color={iconColor} fontSize={20} />}
        <p className='text-wrapper-2'>{title}</p> 
      <TooltipInfo title={'Fonte: '+ tooltip}> 
        <span><IoMdInformationCircleOutline size={16} color={'#1F1F1F'}/></span>
      </TooltipInfo>
      {bullet && <span className={bullet} />}
    </div>
    <div className='text-wrapper-3'>
      {isLoading ? <Loading color={'#1F1F1F'} /> : (
        <>
          {value}
          {small && <Small>({small})</Small>}
        </>
      )}
    </div>
  </div>
  )
}