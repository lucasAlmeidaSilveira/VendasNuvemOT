import React, { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { LoadingIcon } from '../Loading';
import { CategorySelect } from '../CategorySelect';
import { useOrders } from '../../context/OrdersContext';
import { ContainerChartLine, ContainerChartPie, ContainerChartStates } from './styles';

const regions = {
  Norte: ['Acre', 'Amapá', 'Amazonas', 'Pará', 'Rondônia', 'Roraima', 'Tocantins'],
  Nordeste: ['Alagoas', 'Bahia', 'Ceará', 'Maranhão', 'Paraíba', 'Pernambuco', 'Piauí', 'Rio Grande do Norte', 'Sergipe'],
  'Centro-Oeste': ['Distrito Federal', 'Goiás', 'Mato Grosso', 'Mato Grosso do Sul'],
  Sudeste: ['Espírito Santo', 'Minas Gerais', 'Rio de Janeiro', 'São Paulo'],
  Sul: ['Paraná', 'Rio Grande do Sul', 'Santa Catarina'],
};

const getRegiao = estado => {
  for (let region in regions) {
    if (regions[region].includes(estado)) {
      return region;
    }
  }
  return null;
};

const baseColor = '#02b2af';

const processDataForPieChart = usersByDevice =>
  Object.entries(usersByDevice).map(([label, value], index) => ({
    id: index,
    value,
    label: label.charAt(0).toUpperCase() + label.slice(1),
  }));

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
        <LoadingIcon color='#1F1F1F' size={32} />
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

function processOrdersForChart(orders, type) {
  const salesByTime = {};

  orders.forEach(order => {
    const date = new Date(order.createdAt);

    let key;
    switch (type) {
      case 'hour':
        key = `${Math.floor(date.getHours() / 2) * 2}:00`; // Agrupando por intervalo de 2 horas
        break;
      case 'weekday':
        key = date.toLocaleDateString('pt-BR', { weekday: 'long' });
        break;
      case 'monthday':
        key = `${date.getDate()}`;
        break;
      default:
        key = `${Math.floor(date.getHours() / 2) * 2}:00`;
    }
    salesByTime[key] = (salesByTime[key] || 0) + 1;
  });

  let labels;
  switch (type) {
    case 'hour':
      labels = Array.from({ length: 12 }, (_, index) => `${index * 2}:00`);
      break;
    case 'weekday':
      labels = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
      break;
    case 'monthday':
      labels = Array.from({ length: 31 }, (_, index) => `${index + 1}`);
      break;
    default:
      labels = Array.from({ length: 12 }, (_, index) => `${index * 2}:00`);
  }

  const data = labels.map(label => ({
    name: label,
    vendas: salesByTime[label] || 0,
  }));

  return data;
}

export function ChartLine({ orders, title, loading }) {
  const { date, setDate } = useOrders();
  const [dataPoints, setDataPoints] = useState([]);
  const [timeType, setTimeType] = useState('hour');

  useEffect(() => {
    const [startDate, endDate] = date;
    const filteredOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });

    const data = processOrdersForChart(filteredOrders, timeType);
    setDataPoints(data);
  }, [orders, timeType, date]);

  const dateDiff = Math.ceil((date[1] - date[0]) / (1000 * 60 * 60 * 24));

  const options = [
    { value: 'hour', label: 'hora' },
    { value: 'weekday', label: 'últimos 7 dias' },
    { value: 'monthday', label: 'últimos 31 dias' },
  ];

  const handleCategoryChange = event => {
    const selectedType = event.target.value;
    setTimeType(selectedType);

    if (selectedType === 'weekday' && dateDiff < 7) {
      const newStartDate = new Date(date[1]);
      newStartDate.setDate(newStartDate.getDate() - 7);
      setDate([newStartDate, date[1]]);
    } else if (selectedType === 'monthday' && dateDiff < 31) {
      const newStartDate = new Date(date[1]);
      newStartDate.setDate(newStartDate.getDate() - 31);
      setDate([newStartDate, date[1]]);
    }
  };

  return (
    <ContainerChartLine>
      <div className='header'>
        <h2>{title}
          <CategorySelect
            options={options}
            selectedCategory={timeType}
            handleCategoryChange={handleCategoryChange}
          />
        </h2>
      </div>
      {loading ? (
        <LoadingIcon color='#1F1F1F' size={32} />
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dataPoints} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="category" dataKey="name" />
            <YAxis type="number" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="vendas" fill={baseColor} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ContainerChartLine>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'white',
        border: '1px solid #ccc',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}>
        <p style={{ fontSize: 12 }}><span style={{ color: baseColor }}>● </span> {payload[0].value} venda{payload[0].value > 1 && 's'}</p>
      </div>
    );
  }

  return null;
};

export function ChartStates({ orders, title, loading }) {
  const [vendasPorEstado, setVendasPorEstado] = useState({});
  const [numberOptions, setNumberOptions] = useState(5);

  useEffect(() => {
    const Vendas = {};
    orders.forEach(order => {
      const estado = order.billingProvince;
      Vendas[estado] = (Vendas[estado] || 0) + 1; // Contando as vendas por estado
    });
    setVendasPorEstado(Vendas);
  }, [orders]);

  let estados = Object.keys(vendasPorEstado).map(estado => ({
    nome: estado,
    Vendas: vendasPorEstado[estado],
    regiao: getRegiao(estado),
  }));

  estados = estados.sort((a, b) => b.Vendas - a.Vendas).slice(0, numberOptions); // Ordenar os estados pela quantidade de vendas e pegar os 5 primeiros

  const getOpacity = (index) => 1 - (index * 0.2); // Reduz a opacidade gradualmente

  const handleCategoryChange = (event) => {
    setNumberOptions(parseInt(event.target.value));
  };

  const options = [
    { value: 5, label: '5 estados' },
    { value: 10, label: '10 estados' },
    { value: 15, label: '15 estados' },
    { value: 20, label: '20 estados' },
  ];

  return (
    <ContainerChartStates>
      <div className='header'>
        <h2>{title}</h2>
        <CategorySelect
          options={options}
          selectedCategory={numberOptions}
          handleCategoryChange={handleCategoryChange}
        />
      </div>
      {loading ? (
        <LoadingIcon color='#1F1F1F' size={32} />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={estados} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="nome" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Vendas">
              {estados.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`rgba(2, 178, 175, ${getOpacity(index)})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ContainerChartStates>
  );
}
