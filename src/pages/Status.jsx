import React, { useState, useEffect } from 'react';
import { Header } from '../components/Header';
import { Table, Theme, Flex } from '@radix-ui/themes';
import { PiCheckCircleBold, PiXCircleBold } from 'react-icons/pi';
import { getStatusPlatform } from '../api/statusPlatform';
import logoTiny from "../assets/images/platforms/logo-tiny.webp"
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const PLATAFORMAS = [
  { id: 'tiny_integradaes', label: 'Tiny Integradaes', icon: logoTiny },
  { id: 'tiny_abstract', label: 'Tiny Abstract', icon: logoTiny },
];

export function StatusPage() {
  const [statusList, setStatusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarStatus = async () => {
      setLoading(true);
      setErro(null);
      try {
        const resultados = await Promise.all(
          PLATAFORMAS.map(async ({ id, label, icon }) => {
            try {
              const data = await getStatusPlatform({ platform: id });
              return { id, label, icon, status: data?.status, erro: null };
            } catch (err) {
              return { id, label, icon, status: null, erro: err.message || 'Erro ao buscar status' };
            }
          })
        );
        setStatusList(resultados);
      } catch (err) {
        setErro(err.message || 'Erro ao carregar status das plataformas');
      } finally {
        setLoading(false);
      }
    };
    buscarStatus();
  }, []);

  const exibirStatus = (item) => {
    if (item.erro) return item.erro;
    // 1 = positivo (Online), 0 = negativo (Offline)
    const positivo = Number(item.status) === 1;
    return (
      <Flex gap="1" align="center">
        {positivo ? (
          <>
            <FaCheckCircle size={18} color="green" />
            Online
          </>
        ) : (
          <>
            <FaTimesCircle size={18} color="crimson" />
            Offline
          </>
        )}
      </Flex>
    );
  };

  return (
    <div>
      <Header />

      <Theme>
        {loading ? (
          <Table.Root variant="surface" layout="auto">
            <Table.Header style={{ backgroundColor: 'lightgray' }}>
              <Table.Row>
                <Table.ColumnHeaderCell>Plataforma</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {[...Array(3)].map((_, i) => (
                <Table.Row key={i}>
                  <Table.Cell>
                    <div style={{ width: 100, height: 16, background: '#e0e0e0', borderRadius: 4 }} />
                  </Table.Cell>
                  <Table.Cell>
                    <div style={{ width: 80, height: 16, background: '#e0e0e0', borderRadius: 4 }} />
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        ) : erro ? (
          <p style={{ color: 'crimson' }}>{erro}</p>
        ) : (
          <Table.Root variant="surface">
            <Table.Header style={{ backgroundColor: 'lightgray' }}>
              <Table.Row>
                <Table.ColumnHeaderCell>Plataforma</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {statusList.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <Flex gap="1" align="center">
                      <img src={item.icon} alt={item.label} style={{ width: 24, height: 24, borderRadius: 4 }} />
                      {item.label}
                    </Flex>
                  </Table.Cell>
                  <Table.Cell>{exibirStatus(item)}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Theme>
    </div>
  );
}
