import parsePhoneNumberFromString from 'libphonenumber-js';
import { Category, Cost, CouponProps, Order } from '../types';

// Função para formatar o valor em reais
export function formatCurrency(value: string | number): string {
  if (typeof value === 'string') {
    value = parseFloat(value);
  }
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Função para formatar a data para "YYYY-MM-DD"
export function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // getMonth() retorna 0-11, adicionar 1 para 1-12
  const day = date.getDate();

  // Preenche com zero à esquerda se necessário (para garantir o formato MM e DD)
  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;

  return `${year}-${formattedMonth}-${formattedDay}`;
}

export function formatDateShort(dateString: string) {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date
    .toLocaleString('default', { month: 'short' })
    .replace('.', '');
  return `${day} ${month}`;
}

export function parseCurrency(value: string | number): number {
  const stringValue = typeof value === 'number' ? value.toString() : value;
  const number = Number(
    stringValue.replace(/[^0-9,-]+/g, '').replace(',', '.'),
  );
  return isNaN(number) ? 0 : number;
}

export function calculateAverageTicket(orders: Order[]): number {
  if (orders.length === 0) return 0;

  const totalSum = orders.reduce((sum: number, order: Order) => {
    const orderTotal = parseFloat(
      order.total.replace(/[.,]/g, '').replace(/(\d+)(\d{2})$/, '$1.$2'),
    );
    return sum + orderTotal;
  }, 0);

  return totalSum / orders.length;
}

export function adjustDate(date: string) {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate.toISOString().toString();
}

// Função para formatar a data para ISO 8601
export function formatDateToISO(date: Date) {
  return date.toISOString();
}

export function formatTimeDifference(lastUpdated: string) {
  const now = new Date();
  const lastUpdatedDate = new Date(
    new Date(lastUpdated).getTime() + 3 * 60 * 60 * 1000,
  ); // Ajusta a data armazenada subtraindo 3 horas
  const diff = Math.abs(now.getTime() - lastUpdatedDate.getTime());
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));

  if (hours > 0) {
    return `${hours} ${hours === 1 ? 'hora' : 'horas'}`;
  } else {
    return `${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
  }
}

export function formatDateToUTC(
  dateString: string,
  typeDate: string = 'default',
) {
  const date = new Date(dateString);

  const options = {
    dateSimple: {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    },
    default: {
      timeZone: 'America/Sao_Paulo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    },
  };

  const formatOptions =
    typeDate && options[typeDate] ? options[typeDate] : options.default;

  return date.toLocaleString('pt-BR', formatOptions);
}

export function formatPhoneNumber(phoneNumber: string) {
  const parsedNumber = parsePhoneNumberFromString(phoneNumber);
  if (parsedNumber) {
    return parsedNumber.formatNational();
  }
  return 'Número inválido';
}

export const calculateRoas = (ordersNumber: number, adSpend: number) =>
  adSpend > 0 ? (ordersNumber / adSpend).toFixed(2) : '0.00';

export const calculatePopupRate = (orders: Order[], popups: Order[]) => {
  const numericOrders = orders.length;
  const numericPopups = popups.length;

  return numericOrders > 0
    ? ((numericPopups / numericOrders) * 100).toFixed(2) + '%'
    : '0.00%';
};

export const formatUrlProduct = (landing_url: string) => {
  const parts = landing_url.split('/');

  // Se a URL tiver menos de 5 partes, retornamos a URL inteira
  if (parts.length < 5) {
    return landing_url;
  }

  // Junta as partes até o quinto '/'
  return parts.slice(0, 5).join('/');
};

function addBusinessDays(startDate, days) {
  const holidays_br = new Set([
    // Feriados Nacionais
    '2024-01-01', // Confraternização Universal (Ano Novo)
    '2024-02-13', // Carnaval
    '2024-03-29', // Sexta-feira Santa
    '2024-03-31', // Páscoa
    '2024-04-07', // Paixão de Cristo
    '2024-04-21', // Tiradentes
    '2024-05-01', // Dia do Trabalho
    '2024-06-20', // Corpus Christi
    '2024-09-07', // Independência do Brasil
    '2024-10-12', // Nossa Senhora Aparecida
    '2024-11-02', // Finados
    '2024-11-15', // Proclamação da República
    '2024-12-25', // Natal

    // Feriados Estaduais
    '2024-07-09', // Revolução Constitucionalista

    // Feriados Municipais
    '2024-01-25', // Aniversário da Cidade de São Paulo
    '2024-11-20', // Consiencia Negra
  ]);

  // Função para formatar a data no formato 'yyyy-mm-dd'
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  let date = new Date(startDate);
  let addedDays = 0;

  while (addedDays < days) {
    date.setDate(date.getDate() + 1);

    // Verificar se não é sábado (6), domingo (0) e se não é feriado
    if (
      date.getDay() !== 5 &&
      date.getDay() !== 6 &&
      !holidays_br.has(formatDate(date))
    ) {
      addedDays++;
    }
  }

  return date;
}

export const isLate = (order: Order) => {
  const shippingDays = 4;
  const shippingDeadline = addBusinessDays(order.paid_at, shippingDays);

  return (
    new Date() > shippingDeadline &&
    order.shipping_status !== 'closed' &&
    order.payment_details.method !== 'other' &&
    order.payment_status === 'paid' &&
    order.shipping_status !== 'shipped'
  );
};

export const generateDataCosts = (orders: Order[], couponsList: string[]) => {
  return [
    {
      name: 'Total',
      value: orders.reduce((acc, order) => acc + parseFloat(order.total), 0),
      quantity: orders.length,
    },
    ...couponsList.map((couponCode) => ({
      name: couponCode,
      value: orders
        .filter((order) =>
          order.coupon.some((coupon) => coupon.code === couponCode),
        )
        .reduce((acc, order) => acc + parseFloat(order.total), 0),
      quantity: orders.filter((order) =>
        order.coupon.some((coupon) => coupon.code === couponCode),
      ).length,
    })),
  ];
};

export const generateRoasData = (
  categories: Category[],
  totalCosts: Cost[],
) => {
  return categories.map((category) => {
    const matchingCost = totalCosts.find(
      (cost) => cost.name.toLowerCase() === category.name.toLowerCase(),
    );

    return {
      name: category.name,
      value: calculateRoas(category.value, matchingCost?.value || 0),
    };
  });
};
