import styled from "styled-components";

export const ContainerStatusData = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
  gap: .4rem;
  padding: 4px 8px;
  background-color: var(--status-warn-bg);
  border-radius: 24px;
  color: var(--status-warn-fg);
  font-size: 1.2rem;
  font-weight: 600;
  border: 1px solid var(--status-warn-fg);
`

export const ContainerStatusInitialData = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
  gap: .4rem;
  padding: 4px 8px;
  background-color: var(--status-danger-bg);
  border-radius: 24px;
  color: var(--status-danger-fg);
  font-size: 1.2rem;
  font-weight: 600;
  border: 1px solid var(--status-danger-fg);
`

export const ContainerStatusDataSuccess = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
  gap: .4rem;
  padding: 4px 8px;
  background-color: var(--status-ok-bg);
  border-radius: 24px;
  color: var(--status-ok-fg);
  font-size: 1.2rem;
  font-weight: 600;
  border: 1px solid var(--status-ok-fg);
`;

export const ContainerStatusDataWait = styled.div`
  display: flex;
  align-items: center;
  justify-items: center;
  gap: .4rem;
  padding: 4px 8px;
  background-color: var(--status-info-bg);
  border-radius: 24px;
  color: var(--status-info-fg);
  font-size: 1.2rem;
  font-weight: 600;
  border: 1px solid var(--status-info-fg);
`;