import React, { useState, useEffect } from 'react';
import { PieChart, pieArcLabelClasses } from '@mui/x-charts/PieChart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { Loading } from '../Loading';
import { CategorySelect } from '../CategorySelect';
import { useOrders } from '../../context/OrdersContext';
import {
  ContainerChartLine,
  ContainerChartPie,
  ContainerChartStates,
} from './styles';
import { formatCurrency } from '../../tools/tools';

const regions = {
  Norte: [
    'Acre',
    'Amapá',
    'Amazonas',
    'Pará',
    'Rondônia',
    'Roraima',
    'Tocantins',
  ],
  Nordeste: [
    'Alagoas',
    'Bahia',
    'Ceará',
    'Maranhão',
    'Paraíba',
    'Pernambuco',
    'Piauí',
    'Rio Grande do Norte',
    'Sergipe',
  ],
  'Centro-Oeste': [
    'Distrito Federal',
    'Goiás',
    'Mato Grosso',
    'Mato Grosso do Sul',
  ],
  Sudeste: ['Espírito Santo', 'Minas Gerais', 'Rio de Janeiro', 'São Paulo'],
  Sul: ['Paraná', 'Rio Grande do Sul', 'Santa Catarina'],
};

const getRegiao = (estado) => {
  for (let region in regions) {
    if (regions[region].includes(estado)) {
      return region;
    }
  }
  return null;
};

const baseColor = '#02b2af';

const processDataForPieChart = (usersByDevice) =>
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
        <Loading />
      ) : (
        <PieChart
          series={[
            {
              data,
              highlightScope: { faded: 'global', highlighted: 'item' },
              paddingAngle: 2,
              cornerRadius: 4,
              innerRadius: 48,
              arcLabel: (item) => `${((item.value / total) * 100).toFixed(0)}%`,
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

  orders.forEach((order) => {
    const date = new Date(order.created_at);

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

    // Se o salesByTime[key] ainda não existe, inicializamos com vendas = 0 e totalVendas = 0
    if (!salesByTime[key]) {
      salesByTime[key] = { vendas: 0, totalVendas: 0 };
    }

    // Incrementa a quantidade de vendas e o total de vendas para cada chave
    salesByTime[key].vendas += 1;
    salesByTime[key].totalVendas += parseFloat(order.total); // Assumindo que 'order.total' é o valor da venda
  });

  let labels;
  switch (type) {
    case 'hour':
      labels = Array.from({ length: 12 }, (_, index) => `${index * 2}:00`);
      break;
    case 'weekday':
      labels = [
        'domingo',
        'segunda-feira',
        'terça-feira',
        'quarta-feira',
        'quinta-feira',
        'sexta-feira',
        'sábado',
      ];
      break;
    case 'monthday':
      labels = Array.from({ length: 31 }, (_, index) => `${index + 1}`);
      break;
    default:
      labels = Array.from({ length: 12 }, (_, index) => `${index * 2}:00`);
  }

  // Montando o array de dados com 'vendas' e 'totalVendas'
  const data = labels.map((label) => ({
    name: label,
    vendas: salesByTime[label]?.vendas || 0,
    value: salesByTime[label]?.totalVendas || 0,
  }));

  return data;
}

export function ChartLine({ orders, title, loading }) {
  const { date, setDate } = useOrders();
  const [dataPoints, setDataPoints] = useState([]);
  const [timeType, setTimeType] = useState('hour');

  useEffect(() => {
    const data = processOrdersForChart(orders, timeType);
    setDataPoints(data);
  }, [loading, timeType, date]);

  const dateDiff = Math.ceil((date[1] - date[0]) / (1000 * 60 * 60 * 24));

  const options = [
    { value: 'hour', label: 'hora' },
    { value: 'weekday', label: 'últimos 7 dias' },
    { value: 'monthday', label: 'últimos 31 dias' },
  ];

  const resetTimeToStartOfDay = (date) => {
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const handleCategoryChange = (event) => {
    const selectedType = event.target.value;
    setTimeType(selectedType);

    const endDate = new Date(date[1]);
    const newStartDate = new Date(endDate);

    if (selectedType === 'weekday' && dateDiff < 7) {
      newStartDate.setDate(newStartDate.getDate() - 7);
      setDate([resetTimeToStartOfDay(newStartDate), endDate]);
    } else if (selectedType === 'monthday' && dateDiff < 31) {
      newStartDate.setDate(newStartDate.getDate() - 31);
      setDate([resetTimeToStartOfDay(newStartDate), endDate]);
    }
  };

  return (
    <ContainerChartLine>
      <div className="header">
        <h2>
          {title}
          <CategorySelect
            options={options}
            selectedCategory={timeType}
            handleCategoryChange={handleCategoryChange}
          />
        </h2>
      </div>
      {loading ? (
        <Loading />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
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
    const sales = payload[0].value;
    const totalSales =
      payload[0]?.payload?.value === undefined
        ? '0,00'
        : payload[0]?.payload?.value;

    return (
      <div
        style={{
          background: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ fontSize: 12 }}>
          <span style={{ color: baseColor }}>● </span> {sales} venda
          {sales > 1 && 's'}
        </p>
        <p style={{ fontSize: 12 }}>
          <span style={{ color: '#82ca9d' }}>● </span>
          {formatCurrency(totalSales)}
        </p>
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
    orders.forEach((order) => {
      const estado = order.billing_province;
      if (!Vendas[estado]) {
        Vendas[estado] = { vendas: 0, totalVendas: 0 }; // Inicializa com vendas e totalVendas
      }
      Vendas[estado].vendas += 1; // Contando as vendas por estado
      Vendas[estado].totalVendas += parseFloat(order.total); // Acumulando o valor total das vendas
    });
    setVendasPorEstado(Vendas);
  }, [orders]);

  let estados = Object.keys(vendasPorEstado).map((estado) => ({
    nome: estado,
    vendas: vendasPorEstado[estado].vendas,
    value: vendasPorEstado[estado].totalVendas,
    regiao: getRegiao(estado),
  }));

  estados = estados.sort((a, b) => b.vendas - a.vendas).slice(0, numberOptions); // Ordenar os estados pela quantidade de vendas e pegar os 5 primeiros

  const getOpacity = (index) => 1 - index * 0.2; // Reduz a opacidade gradualmente

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
      <div className="header">
        <h2>{title}</h2>
        <CategorySelect
          options={options}
          selectedCategory={numberOptions}
          handleCategoryChange={handleCategoryChange}
        />
      </div>
      {loading ? (
        <Loading />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={estados} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis type="category" dataKey="nome" />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="vendas" name="Quantidade de Vendas">
              {estados.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`rgba(2, 178, 175, ${getOpacity(index)})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ContainerChartStates>
  );
}

export function ChartLojas({ orders, title, loading }) {
  const [vendasPorLoja, setVendasPorLoja] = useState({});
  const [numberOptions, setNumberOptions] = useState(5);

  useEffect(() => {
    const Vendas = {};
    orders.forEach((order) => {
      let loja = order.billing_business_name;
      // Se a loja não for uma das permitidas, ignora o pedido
      const lojasPermitidas = [
        'ANALIA',
        'GABRIEL',
        'TURIASSU',
        'MOEMA',
        'CHATBOT',
      ];

      if (loja === null && order.billing_name === 'Cliente Loja Física') {
        loja = 'CHATBOT';
      }

      if (!lojasPermitidas.includes(loja)) {
        return; // Ignora este pedido
      }

      if (!Vendas[loja]) {
        Vendas[loja] = {
          vendas: 0,
          totalVendas: 0,
        }; // Inicializa com vendas e totalVendas
      }

      const quantidadePedido =
        order.products?.reduce((total, product) => {
          return total + (parseInt(product.quantity) || 0);
        }, 0) || 0;

      Vendas[loja].vendas += quantidadePedido; // Contando as vendas por loja
      Vendas[loja].totalVendas += parseFloat(order.total) || 0; // Acumulando o valor total das vendas
    });
    setVendasPorLoja(Vendas);
  }, [orders]);

  let lojas = Object.keys(vendasPorLoja).map((loja) => ({
    nome: loja,
    vendas: vendasPorLoja[loja].vendas,
    value: vendasPorLoja[loja].totalVendas,
    regiao: getRegiao(loja),
  }));

  lojas = lojas.sort((a, b) => b.value - a.value).slice(0, numberOptions); // Ordenar os lojas pela quantidade de vendas e pegar os 5 primeiros

  const getOpacity = (index) => 1 - index * 0.2; // Reduz a opacidade gradualmente

  const handleCategoryChange = (event) => {
    setNumberOptions(parseInt(event.target.value));
  };

  const options = [
    { value: 5, label: '5 lojas' },
    { value: 10, label: '10 lojas' },
    { value: 15, label: '15 lojas' },
    { value: 20, label: '20 lojas' },
  ];

  return (
    <ContainerChartStates>
      <div className="header">
        <h2>{title}</h2>
        <CategorySelect
          options={options}
          selectedCategory={numberOptions}
          handleCategoryChange={handleCategoryChange}
        />
      </div>
      {loading ? (
        <Loading />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={lojas} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis type="number" />
            <XAxis type="category" dataKey="nome" />
            <Tooltip content={<CustomTooltipVendasLojas />} />
            <Bar dataKey="value" name="Valor de Vendas (R$)">
              {lojas.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`rgba(2, 178, 175, ${getOpacity(index)})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ContainerChartStates>
  );
}

export function ChartClienteLojas({ orders, title, loading }) {
  const [vendasPorLoja, setVendasPorLoja] = useState({});
  const [numberOptions, setNumberOptions] = useState(5);

  useEffect(() => {
    const Vendas = {};
    orders.forEach((order) => {
      let loja = order.billing_business_name;
      // Se a loja não for uma das permitidas, ignora o pedido
      const lojasPermitidas = [
        'ANALIA',
        'GABRIEL',
        'TURIASSU',
        'MOEMA',
        'CHATBOT',
      ];

      if (loja === null && order.billing_name === 'Cliente Loja Física') {
        loja = 'CHATBOT';
      }

      if (!lojasPermitidas.includes(loja)) {
        return; // Ignora este pedido
      }

      if (!Vendas[loja]) {
        Vendas[loja] = {
          vendas: 0,
          totalVendas: 0,
        }; // Inicializa com vendas e totalVendas
      }

      const quantidadePedido =
        order.products?.reduce((total, product) => {
          return total + (parseInt(product.quantity) || 0);
        }, 0) || 0;

      Vendas[loja].vendas += quantidadePedido; // Contando as vendas por loja
      Vendas[loja].totalVendas += parseFloat(order.total) || 0; // Acumulando o valor total das vendas
    });
    setVendasPorLoja(Vendas);
  }, [orders]);

  let lojas = Object.keys(vendasPorLoja).map((loja) => ({
    nome: loja,
    vendas: vendasPorLoja[loja].vendas,
    value: vendasPorLoja[loja].totalVendas,
    regiao: getRegiao(loja),
  }));

  lojas = lojas.sort((a, b) => b.vendas - a.vendas).slice(0, numberOptions); // Ordenar os lojas pela quantidade de vendas e pegar os 5 primeiros

  const getOpacity = (index) => 1 - index * 0.2; // Reduz a opacidade gradualmente

  const handleCategoryChange = (event) => {
    setNumberOptions(parseInt(event.target.value));
  };

  const options = [
    { value: 5, label: '5 lojas' },
    { value: 10, label: '10 lojas' },
    { value: 15, label: '15 lojas' },
    { value: 20, label: '20 lojas' },
  ];

  return (
    <ContainerChartStates>
      <div className="header">
        <h2>{title}</h2>
        <CategorySelect
          options={options}
          selectedCategory={numberOptions}
          handleCategoryChange={handleCategoryChange}
        />
      </div>
      {loading ? (
        <Loading />
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={lojas} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <YAxis type="number" />
            <XAxis type="category" dataKey="nome" />
            <Tooltip content={<CustomTooltipClientesLojas />} />
            <Bar dataKey="vendas" name="Número de Clientes">
              {lojas.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`rgba(2, 178, 175, ${getOpacity(index)})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ContainerChartStates>
  );
}
const CustomTooltipVendasLojas = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const totalSales =
      payload[0]?.payload?.value === undefined
        ? '0,00'
        : payload[0]?.payload?.value;

    return (
      <div
        style={{
          background: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ fontSize: 12 }}>
          <span style={{ color: '#82ca9d' }}>● </span>
          {formatCurrency(totalSales)}
        </p>
      </div>
    );
  }

  return null;
};

const CustomTooltipClientesLojas = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const sales = payload[0].payload.vendas;

    return (
      <div
        style={{
          background: 'white',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <p style={{ fontSize: 12 }}>
          <span style={{ color: baseColor }}>● </span> {sales} cliente
          {sales > 1 && 's'}
        </p>
      </div>
    );
  }

  return null;
};
