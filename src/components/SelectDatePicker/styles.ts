import { styled, css } from 'styled-components';

/* Overrides dos estados dos dias no modo escuro.

   O react-calendar traz seu CSS em node_modules (importado em FilterDate e
   Dashboard) com cores fixas para fundo branco: selecionado #006edc, hoje
   #ffff76, hover #e6e6e6, desabilitado #f0f0f0. Sobre o painel escuro
   (--surface) o dia selecionado fica com ~2.4:1 de contraste.

   O `&&` duplica a classe do container só para ganhar especificidade do CSS do
   vendor sem `!important`. Os pseudo-selectors (:enabled:hover) são espelhados
   pelo mesmo motivo. Nada aqui vale no claro — o modo claro segue idêntico. */
const darkCalendarTiles = css`
  [data-theme='dark'] && .calendar-view {
    /* cabeçalho dos dias da semana */
    .react-calendar__month-view__weekdays__weekday abbr {
      color: var(--text-secondary);
      text-decoration: none;
    }

    /* dias fora do mês corrente e fins de semana (vendor: #757575 e #d10000) */
    .react-calendar__month-view__days__day--neighboringMonth {
      color: var(--text-muted);
    }

    .react-calendar__month-view__days__day--weekend {
      color: var(--status-danger-fg);
    }

    /* hover (vendor: #e6e6e6) */
    .react-calendar__tile:enabled:hover,
    .react-calendar__tile:enabled:focus {
      background-color: var(--surface-hover);
      color: var(--text-primary);
    }

    /* fora de minDate/maxDate (vendor: #f0f0f0 sobre #ababab) */
    .react-calendar__tile:disabled {
      background-color: transparent;
      color: var(--text-muted);
    }

    /* hoje: anel de acento em vez do amarelo #ffff76 */
    .react-calendar__tile--now,
    .react-calendar__tile--now:enabled:hover,
    .react-calendar__tile--now:enabled:focus {
      background-color: transparent;
      color: var(--accent);
      box-shadow: inset 0 0 0 2px var(--accent);
    }

    /* selecionado e extremos do intervalo — a correção central */
    .react-calendar__tile--active {
      background-color: var(--accent);
      color: var(--on-accent);
      font-weight: 600;
      box-shadow: none;
    }

    .react-calendar__tile--active:enabled:hover,
    .react-calendar__tile--active:enabled:focus {
      background-color: var(--accent-hover);
      color: var(--on-accent);
    }

    /* miolo do intervalo: tinta do acento, para os extremos seguirem lendo
       como âncoras. O --surface-3 é o fallback de quem não tem color-mix. */
    .react-calendar__tile--range:not(.react-calendar__tile--rangeStart):not(.react-calendar__tile--rangeEnd) {
      background-color: var(--surface-3);
      background-color: color-mix(in srgb, var(--accent) 26%, var(--surface));
      color: var(--text-primary);
      font-weight: 400;
    }

    /* hoje quando também está selecionado: o anel precisa mudar de tom, senão
       desaparece contra o fundo de acento */
    .react-calendar__tile--now.react-calendar__tile--active {
      background-color: var(--accent);
      color: var(--on-accent);
      box-shadow: inset 0 0 0 2px var(--accent-hover);
    }

    /* navegação de mês/ano (vendor: #e6e6e6 no hover, #f0f0f0 no disabled) */
    .react-calendar__navigation button:enabled:hover,
    .react-calendar__navigation button:enabled:focus {
      background-color: var(--surface-hover);
    }

    .react-calendar__navigation button:disabled {
      background-color: transparent;
      color: var(--text-muted);
    }
  }

  /* preview do intervalo enquanto o segundo clique não veio. A classe
     --selectRange fica no MESMO elemento que .calendar-view (é o calendarClassName),
     por isso esta regra vive fora do bloco acima. */
  [data-theme='dark']
    &&
    .calendar-view.react-calendar--selectRange
    .react-calendar__tile--hover {
    background-color: var(--surface-hover);
    color: var(--text-primary);
  }

  /* o wrapper desabilitado do react-date-picker também é #f0f0f0 no vendor */
  [data-theme='dark'] && .react-date-picker--disabled .react-date-picker__wrapper {
    background-color: var(--surface-2);
    color: var(--text-muted);
  }
`;

/* Painel do calendário — compartilhado pelas duas variantes. No escuro quem
   entrega a elevação é a borda (--elevation-border); no claro ela é
   transparent, então a sombra continua sendo a única coisa visível. */
const calendarView = css`
  .calendar-view {
    border-radius: 1.2rem;
    border: none;
    background-color: var(--surface);
    box-shadow: 0px 1px 4px var(--shadow-color-soft),
      0 0 0 1px var(--elevation-border);

    button {
      font-size: 1rem;
      font-family: 'Poppins', sans-serif;
      color: var(--text-primary);

      span {
        font-size: 1.4rem;
        text-transform: uppercase;
      }
    }
  }

  ${darkCalendarTiles}
`;

export const ContainerDatePickerIcon = styled.div`
  .react-date-picker__inputGroup {
    display: none;
  }

  .react-date-picker__wrapper {
    border-radius: 1.2rem;
    max-width: 200px;
    padding: 0.4rem 0.8rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.2rem;
    background-color: var(--surface);
    color: var(--text-primary);
    border: none;
    box-shadow: 0px 1px 4px var(--shadow-color-soft);
  }

  ${calendarView}
`;

export const ContainerDatePicker = styled.div`
  .calendar {
    flex: 1;
  }

  .react-date-picker__wrapper {
    border-radius: 1.2rem;
    max-width: 200px;
    padding: 0.4rem 0.8rem;
    font-family: 'Poppins', sans-serif;
    font-size: 1.4rem;
    background-color: var(--surface);
    color: var(--text-primary);
    border: none;
    box-shadow: 0px 1px 4px var(--shadow-color-soft);
  }

  ${calendarView}
`;
