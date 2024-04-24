import React, { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { LineChart } from '@mui/x-charts/LineChart';
import { ContainerChartLine, ContainerChartPie } from './styles';
import { Loading, LoadingIcon } from '../Loading';

export function Chart({ usersByDevice, title, loading }) {
  const [ data, setData ] = useState([])
  
  useEffect(() => {
    setData(() => (
      // Converter os dados para o formato esperado pelo PieChart
      Object.entries(usersByDevice).map(([label, value], index) => ({
          id: index,
          value,
          label: label.charAt(0).toUpperCase() + label.slice(1),
        }))
      ))
  }, [usersByDevice])

  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <ContainerChartPie>
      <h2>{title}</h2>
      {loading ? (
        <LoadingIcon color={'#1F1F1F'} size={32} />
      ) : (
        <PieChart
          series={[
            {
              data,
              highlightScope: { faded: 'global', highlighted: 'item' },
              paddingAngle: 2,
              cornerRadius: 4,
              innerRadius: 48,
              arcLabel: item => `${((item.value / total) * 100).toFixed(0)}%`,
              arcLabelMinAngle: 30,
            },
          ]}
          sx={{
            [`& .${pieArcLabelClasses.root}`]: {
              fill: '#fcfafb',
              fontWeight: '600',
              fontSize: 14,
            },
          }}
          height={8 * 24}
        />
      )}
    </ContainerChartPie>
  );
}

export function ChartLine({ orders, title, loading }) {
  const [dataPoints, setDataPoints] = useState([]);
  const [timeLabels, setTimeLabels] = useState([]);

  useEffect(() => {
    const salesByTime = {};
    // Processar dados para cada pedido
    orders.forEach(order => {
      const date = new Date(order.createdAt);
      const hour = date.getHours();
      const key = `${hour}:00`; // Agora usa apenas a hora para o intervalo de 1 hora
      salesByTime[key] = (salesByTime[key] || 0) + 1; // Incrementa a contagem para o intervalo
    });

    // Gerar rótulos para todas as horas do dia (0 a 23)
    const labels = Array.from({ length: 23 }, (_, index) => index);

    // Preencher os dados ausentes com zero vendas

    setTimeLabels(labels);
  }, [orders]);

  return (
    <ContainerChartLine>
      <h2>{title}</h2>
      {loading ? (
        <LoadingIcon color={'#1F1F1F'} size={32} />
      ) : (
        <LineChart
          xAxis={[{ data: timeLabels, label: 'horas'}]}
          yAxis={[{ label: 'vendas' }]}
          series={[
            {
              data: dataPoints,
              area: true,
              showMark: false,
            },
          ]}
          height={300}
        />
      )}
    </ContainerChartLine>
  );
}
