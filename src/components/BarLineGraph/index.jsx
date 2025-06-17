import React, { useMemo } from "react";
import { Tabs, SortingTable } from "ama-design-system";
import { Bar } from "react-chartjs-2";

import { useTheme } from '../../context/ThemeContext';

export function BarLineGraphTabs({ columnsOptions, dataList, dataHeaders, barData, barOptions }) {
  const { theme } = useTheme();
  const memoBarData = useMemo(() => barData, [barData]);
  const memoBarOptions = useMemo(() => barOptions, [barOptions]);

  const tabs = [
    {
      eventKey: "tab1",
      title: "Gráfico",
      component: (
        <div style={{ padding: 20 }}>
          <Bar 
            role="img"
            aria-label="Gráfico de barras mostrando a distribuição de pontuações de acessibilidade"
            data={memoBarData} 
            options={memoBarOptions} 
          />
        </div>
      ),
    },
    {
      eventKey: "tab2",
      title: "Tabela",
      component: (
        <SortingTable
          hasSort={false}
          headers={dataHeaders}
          dataList={dataList}
          darkTheme={theme}
          pagination={false}
          links={false}
          caption="Table Caption"
          columnsOptions={columnsOptions}
        />
      ),
    },
  ];

  return (
    <>
      <Tabs tabs={tabs} defaultActiveKey={"tab1"} darkTheme={theme} />
    </>
  );
}
