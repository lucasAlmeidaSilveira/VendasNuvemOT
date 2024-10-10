import React from 'react';
import { Loading } from '../Loading';
import { TooltipInfo } from '../TooltipInfo';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { Small } from './styles';
import { formatCurrency } from '../../tools/tools';
import { MdOutlineHelpOutline } from 'react-icons/md';
import { BudgetItemListProps, BudgetItemProps } from "../../types";

export function BudgetItemList({
  icon: Icon,
  iconColor,
  dataCosts,
  title,
  tooltip,
  info,
  value,
  isLoading,
  small,
}: BudgetItemListProps) {
  return (
    <div className='div'>
      <div className='title-box'>
        {Icon && <Icon color={iconColor} fontSize={18} />}
        <p className='text-wrapper-2'>{title}</p>
        <TooltipInfo title={tooltip}>
          <span>
            <IoMdInformationCircleOutline size={16} color={'#1F1F1F'} />
          </span>
        </TooltipInfo>
      </div>
      <div className='text-wrapper-4'>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            <div>
              {value}
              {small && <Small>({small})</Small>}
              {info && (
                <TooltipInfo title={info}>
                  <span>
                    <MdOutlineHelpOutline size={16} color={'#1F1F1F'} />
                  </span>
                </TooltipInfo>
              )}
            </div>
            <div className='column-list'>
              {dataCosts && (
                dataCosts.map((data, index) => (
                  <div key={index} className='row-list'>
                    <span style={data.name === 'Total' ? {fontWeight: 'bold', color: 'var(--geralblack-80)'} : {fontWeight: 'inherit'}}>
                      {title === 'ROAS' ? data.value : formatCurrency(data.value)}
                    </span>
                    <span style={data.name === 'Total' ? {fontWeight: 'bold', color: 'var(--geralblack-80)'} : {fontWeight: 'normal'}}>{data.name}</span>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function BudgetItem({
  icon: Icon,
  iconColor,
  bullet,
  title,
  tooltip,
  value,
  isLoading,
  small,
}: BudgetItemProps) {
  return (
    <div className='div'>
      <div className='title-box'>
        {Icon && <Icon color={iconColor} fontSize={18} />}
        <p className='text-wrapper-2'>{title}</p>
        <TooltipInfo title={tooltip}>
          <span>
            <IoMdInformationCircleOutline size={16} color={'#1F1F1F'} />
          </span>
        </TooltipInfo>
        {bullet && <span className={bullet} />}
      </div>
      <div className='text-wrapper-3'>
        {isLoading ? (
          <Loading />
        ) : (
          <>
            {value}
            {small && <Small>({small})</Small>}
          </>
        )}
      </div>
    </div>
  );
}
