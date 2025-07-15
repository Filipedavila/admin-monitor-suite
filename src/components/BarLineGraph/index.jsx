import React, { useMemo } from "react";
import { Tabs, SortingTable } from "ama-design-system";
import { Bar } from "react-chartjs-2";

import { useTheme } from '../../context/ThemeContext';

export function BarLineGraphTabs({ columnsOptions, dataList, dataHeaders, barData, barOptions, darkTheme }) {
  const { theme } = useTheme();
  const memoBarData = useMemo(() => barData, [barData]);
  const memoBarOptions = useMemo(() => barOptions, [barOptions]);

  const tabs = [
    {
      eventKey: "tab1",
      title: "Gráfico",
      component: (
        <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <Bar 
              role="img"
              aria-label="Histograma das pontuações do AccessMonitor"
              data={memoBarData} 
              options={memoBarOptions} 
              darkTheme={darkTheme}
            />
        </div>
      ),
    },
    {
      eventKey: "tab2",
      title: "Tabela",
      component: (
        <SortingTable
          darkTheme={theme}
          hasSort={false}
          headers={dataHeaders}
          dataList={dataList}
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
