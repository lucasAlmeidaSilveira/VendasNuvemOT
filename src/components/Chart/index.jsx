import React, { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { ContainerChartLine, ContainerChartPie } from './styles';
import { LoadingIcon } from '../Loading';
import { BarChart } from '@mui/x-charts/BarChart';

const processDataForPieChart = (usersByDevice) =>
  Object.entries(usersByDevice).map(([label, value], index) => ({
    id: index,
    value,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  }));

const processOrdersForBarChart = (orders) => {
  const salesByTime = {};
  orders.forEach(order => {
    const date = new Date(order.createdAt);
    const hour = date.getHours();
    const key = `${hour}:00`;
    salesByTime[key] = (salesByTime[key] || 0) + 1;
  });
  const labels = Array.from({ length: 23 }, (_, index) => index); // Ajustado para todas as 24 horas
  const data = labels.map(hour => salesByTime[`${hour}:00`] || 0);

  return { labels, data };
};

export function Chart({ usersByDevice, title, loading }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    setData(processDataForPieChart(usersByDevice));
  }, [usersByDevice]);

  const total = data.reduce((acc, item) => acc + item.value, 0);

  return (
    <ContainerChartPie>
      <h2>{title}</h2>
      {loading ? (
        <LoadingIcon color="#1F1F1F" size={32} />
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
    const { labels, data } = processOrdersForBarChart(orders);
    setTimeLabels(labels);
    setDataPoints(data);
  }, [orders]);

  return (
    <ContainerChartLine>
      <h2>{title}</h2>
      {loading ? (
        <LoadingIcon color="#1F1F1F" size={32} />
      ) : (
        <BarChart
          xAxis={[{ data: timeLabels, label: 'Horas', scaleType: 'band' }]}
          yAxis={[{ label: 'Vendas' }]}
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
