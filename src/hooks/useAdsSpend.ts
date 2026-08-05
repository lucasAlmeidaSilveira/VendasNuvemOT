import { useEffect, useState } from 'react';
import { fetchTable } from '../api/db';
import { useDatabaseContext } from '../context/DbContext';
import { DatabaseTable, AdsRow } from '../types';
import { formatDate } from '../tools/tools';

// =====================================================================
// Verba de anúncios (Google + Meta) a partir da tabela `ads` do novo
// backend, no MESMO formato `adSpends` que a aba Statistics consome.
//
// A tabela `ads` é o snapshot do backend das MESMAS fontes do legado
// (Google Analytics / Meta Ads), gravado por cron via /webhook/db/:ads.
// Mapa funding_* -> categoria (ver fetchGoogle/MetaAdsByDate no backend):
//   funding_painting=Quadros, funding_mirror=Espelhos, funding_ecom=Ecom,
//   funding_store=Loja, funding_chatbot=Chatbot, funding_insta=Instagram,
//   funding_general=Geral. Separado por `plataform` ('Google' | 'Meta').
// `ads.store` é o nome amigável ('outlet'/'artepropria').
// =====================================================================

export interface AdSpends {
  google: number;
  googleEcom: number;
  googleQuadros: number;
  googleEspelhos: number;
  googleLoja: number;
  googleGeral: number;
  meta: number;
  metaEcom: number;
  metaChatbot: number;
  metaQuadros: number;
  metaEspelhos: number;
  metaInstagram: number;
  metaGeral: number;
}

export const EMPTY_AD_SPENDS: AdSpends = {
  google: 0,
  googleEcom: 0,
  googleQuadros: 0,
  googleEspelhos: 0,
  googleLoja: 0,
  googleGeral: 0,
  meta: 0,
  metaEcom: 0,
  metaChatbot: 0,
  metaQuadros: 0,
  metaEspelhos: 0,
  metaInstagram: 0,
  metaGeral: 0,
};

const num = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

function computeAdSpends(ads: AdsRow[]): AdSpends {
  const totals: AdSpends = { ...EMPTY_AD_SPENDS };

  for (const ad of ads) {
    const platform = String(ad.plataform ?? '').toLowerCase();
    const ecom = num(ad.funding_ecom);
    const loja = num(ad.funding_store);
    const geral = num(ad.funding_general);
    const chatbot = num(ad.funding_chatbot);
    const insta = num(ad.funding_insta);
    const espelhos = num(ad.funding_mirror);
    const quadros = num(ad.funding_painting);
    const all = ecom + loja + geral + chatbot + insta + espelhos + quadros;

    if (platform === 'google') {
      totals.googleEcom += ecom;
      totals.googleLoja += loja;
      totals.googleGeral += geral;
      totals.googleQuadros += quadros;
      totals.googleEspelhos += espelhos;
      totals.google += all;
    } else if (platform === 'meta') {
      totals.metaEcom += ecom;
      totals.metaChatbot += chatbot;
      totals.metaInstagram += insta;
      totals.metaGeral += geral;
      totals.metaQuadros += quadros;
      totals.metaEspelhos += espelhos;
      totals.meta += all;
    }
  }

  return totals;
}

export function useAdsSpend(store: string, date: [Date, Date] | undefined) {
  const [adSpends, setAdSpends] = useState<AdSpends>(EMPTY_AD_SPENDS);
  const [loading, setLoading] = useState(true);
  const { reloadKey } = useDatabaseContext();

  const start = date?.[0] ? formatDate(date[0]) : undefined;
  const end = date?.[1] ? formatDate(date[1]) : undefined;

  useEffect(() => {
    if (!store || !start || !end) return;
    let active = true;
    setLoading(true);

    fetchTable<AdsRow>(DatabaseTable.ADS, { store, startDate: start, endDate: end })
      .then((rows) => {
        if (!active) return;
        setAdSpends(computeAdSpends(rows ?? []));
        setLoading(false);
      })
      .catch(() => {
        if (!active) return;
        setAdSpends(EMPTY_AD_SPENDS);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [store, start, end, reloadKey]);

  return { adSpends, loading };
}
