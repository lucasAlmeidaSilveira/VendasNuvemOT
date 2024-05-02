import React from 'react';
import { Loading } from '../Loading';
import { formatCurrency } from '../../tools/tools';
import { TooltipInfo } from "../TooltipInfo";

interface BudgetItemProps {
  icon?: React.ElementType;
  iconColor?: string;
  title: string;
  value: number | string;
  isLoading: boolean;
  tooltip?: string;
}

export function BudgetItem ({ icon: Icon, iconColor, title, tooltip, value, isLoading }: BudgetItemProps) {
  
  return (
    <div className='div'>
    <div className='title-box'>
      {Icon && <Icon color={iconColor} fontSize={20} />}
      <TooltipInfo title={tooltip}>
        <p className='text-wrapper-2'>{title}</p>
      </TooltipInfo>
    </div>
    <div className='text-wrapper-3'>
      {isLoading ? <Loading color={'#1F1F1F'} /> : value}
    </div>
  </div>
  )
}