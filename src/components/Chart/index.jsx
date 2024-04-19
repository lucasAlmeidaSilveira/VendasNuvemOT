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
      const roundedHour = hour - (hour % 2); // Arredonda para o intervalo de 2 horas mais próximo
      const key = `${roundedHour}:00`; // Chave para o mapa de contagem
      salesByTime[key] = (salesByTime[key] || 0) + 1; // Incrementa a contagem para o intervalo
    });

    // Ordenar as chaves e preparar dados para o gráfico
    const sortedKeys = Object.keys(salesByTime).sort((a, b) => {
      const hourA = parseInt(a.split(':')[0], 10);
      const hourB = parseInt(b.split(':')[0], 10);
      return hourA - hourB; // Compara as horas convertidas para ordenação numérica
    });

    // Convertendo rótulos para números
    const labels = sortedKeys.map(key => parseInt(key.split(':')[0], 10));
    const data = sortedKeys.map(key => salesByTime[key]);

    setTimeLabels(labels);
    setDataPoints(data);
  }, [orders]);

  return (
    <ContainerChartLine>
      <h2>{title}</h2>
      {loading ? (
        <LoadingIcon color={'#1F1F1F'} size={32} />
      ) : (
        <LineChart
          xAxis={[{ data: timeLabels }]}
          series={[
            {
              data: dataPoints,
              area: true,
            },
          ]}
          height={300}
        />
      )}
    </ContainerChartLine>
  );
}
