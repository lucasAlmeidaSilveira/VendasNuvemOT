import React from 'react';
import { Loading } from '../Loading';
import { TooltipInfo } from '../TooltipInfo';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { Small } from './styles';
import { formatCurrency } from '../../tools/tools';
import { MdOutlineHelpOutline } from 'react-icons/md';

interface BudgetItemStatisticsProps {
  icon?: React.ElementType;
  iconColor?: string;
  dataCosts?: DataCosts[];
  small?: number | string;
  info?: string;
  title: string;
  value: number | string;
  isLoading: boolean;
  tooltip?: string;
}

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

interface DataCosts {
  name: string;
  value: number | string;
}

export function BudgetItemStatistics({
  icon: Icon,
  iconColor,
  dataCosts,
  title,
  tooltip,
  info,
  value,
  isLoading,
  small,
}: BudgetItemStatisticsProps) {
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
                    <span>
                      {title === 'ROAS' ? data.value : formatCurrency(data.value)}
                    </span>
                    <span>{data.name}</span>
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
