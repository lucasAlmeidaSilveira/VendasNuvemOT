import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { BudgetItem } from './BudgetItem';
import { ContainerOrders, ContainerGeral } from './styles';
import { FaMeta } from 'react-icons/fa6';
import { GrMoney } from 'react-icons/gr';
import { MdOutlineAttachMoney } from 'react-icons/md';
import { DiGoogleAnalytics } from 'react-icons/di';
import { formatCurrency } from '../../tools/tools';

interface DataSectionTPagoProps {
  title: string;
  bgcolor: string;
  verbaGoogle: number;
  verbaMeta: number;
  totalAdSpend: number;
  totalOrdersFormatted: number;
  roas: number | string;
  roasMax?: number | string;
  isLoadingADSGoogle: boolean;
  isLoadingOrders: boolean;
  isLoadingADSMeta: boolean;
}

export function DataSectionTPago({
  title,
  bgcolor,
  verbaGoogle,
  verbaMeta,
  totalAdSpend,
  totalOrdersFormatted,
  roas,
  roasMax,
  isLoadingADSGoogle,
  isLoadingOrders,
  isLoadingADSMeta,
}: DataSectionTPagoProps) {
  verbaGoogle = formatCurrency(verbaGoogle);
  verbaMeta = formatCurrency(verbaMeta);
  totalAdSpend = formatCurrency(totalAdSpend);

  return (
    <ContainerOrders>
      <ContainerGeral bgcolor={bgcolor}>
        <h4>
          {title}
        </h4>
        <div className='row'>
          <BudgetItem
            icon={FcGoogle}
            title='Verba Google'
            tooltip="Google ADS"
            value={verbaGoogle}
            isLoading={isLoadingADSGoogle}
          />
          <BudgetItem
            icon={FaMeta}
            iconColor='#008bff'
            title='Verba Meta'
            tooltip="Meta ADS"
            value={verbaMeta}
            isLoading={isLoadingADSMeta}
          />
          <BudgetItem
            icon={GrMoney}
            iconColor='var(--geralblack-100)'
            title='Verba Total'
            tooltip="Google ADS x Meta ADS"
            value={totalAdSpend}
            isLoading={isLoadingADSMeta || isLoadingADSGoogle}
          />
        </div>
        <div className='row'>
          <BudgetItem
            icon={MdOutlineAttachMoney}
            iconColor='var(--uipositive-100)'
            title='Faturamento'
            tooltip="Nuvemshop" 
            value={totalOrdersFormatted}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            icon={DiGoogleAnalytics}
            iconColor='var(--geralblack-100)'
            title='ROAS'
            tooltip="Faturamento x Verba Total"
            value={roas}
            small={roasMax}
            isLoading={isLoadingADSMeta || isLoadingADSGoogle || isLoadingOrders}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
