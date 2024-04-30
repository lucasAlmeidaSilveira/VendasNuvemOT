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
  bgcolor: string;
  verbaGoogle: number;
  verbaMeta: number;
  totalAdSpend: number;
  totalOrdersFormatted: number;
  roas: number | string;
  isLoadingADSGoogle: boolean;
  isLoadingOrders: boolean;
  isLoadingADSMeta: boolean;
}

export function DataSectionTPago({
  bgcolor,
  verbaGoogle,
  verbaMeta,
  totalAdSpend,
  totalOrdersFormatted,
  roas,
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
          Tráfego Pago
        </h4>
        <div className='row'>
          <BudgetItem
            icon={FcGoogle}
            title='Verba Google'
            value={verbaGoogle}
            isLoading={isLoadingADSGoogle}
          />
          <BudgetItem
            icon={FaMeta}
            iconColor='#008bff'
            title='Verba Meta'
            value={verbaMeta}
            isLoading={isLoadingADSMeta}
          />
          <BudgetItem
            icon={GrMoney}
            iconColor='var(--geralblack-100)'
            title='Verba Total'
            value={totalAdSpend}
            isLoading={isLoadingADSGoogle}
          />
        </div>
        <div className='row'>
          <BudgetItem
            icon={MdOutlineAttachMoney}
            iconColor='var(--uipositive-100)'
            title='Faturamento'
            value={totalOrdersFormatted}
            isLoading={isLoadingOrders}
          />
          <BudgetItem
            icon={DiGoogleAnalytics}
            iconColor='var(--geralblack-100)'
            title='ROAS'
            value={roas}
            isLoading={isLoadingOrders}
          />
        </div>
      </ContainerGeral>
    </ContainerOrders>
  );
}
