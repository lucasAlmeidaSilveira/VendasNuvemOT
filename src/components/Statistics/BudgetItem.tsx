import React from 'react';
import { Loading } from '../Loading';
import { formatCurrency } from '../../tools/tools';

interface BudgetItemProps {
  icon?: React.ElementType;
  iconColor?: String;
  title: String;
  value: number | string;
  isLoading: boolean;
}

export function BudgetItem ({ icon: Icon, iconColor, title, value, isLoading }: BudgetItemProps) {
  
  return (
    <div className='div'>
    <div className='title-box'>
      {Icon && <Icon color={iconColor} fontSize={20} />}
      <p className='text-wrapper-2'>{title}</p>
    </div>
    <div className='text-wrapper-3'>
      {isLoading ? <Loading color={'#1F1F1F'} /> : value}
    </div>
  </div>
  )
}