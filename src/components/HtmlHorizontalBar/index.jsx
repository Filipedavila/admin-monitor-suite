import { HtmlHorizontalBar, Tabs, SortingTable } from "@a12e/accessmonitor-ds";
import { useTheme } from "../../context/ThemeContext";

export function HtmlHorizontalBarTabs({
  barData,
  columnsOptions,
  dataHeaders,
  dataList,
}) {
  const { theme } = useTheme();
  const dataset = barData?.datasets?.[0] ?? {};
  const tabs = [
    {
      eventKey: "tab1",
      title: "Gráfico",
      component: (
        <HtmlHorizontalBar
          labels={barData?.labels ?? []}
          data={dataset.data ?? []}
          datasetLabel={dataset.label ?? ""}
          color={dataset.backgroundColor ?? "green"}
          xAxisLabel="Nº de Ocorrências"
          darkTheme={theme}
        />
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
          caption="Práticas de acessibilidade"
          columnsOptions={columnsOptions}
        />
      ),
    },
  ];

  return <Tabs tabs={tabs} defaultActiveKey="tab1" darkTheme={theme} />;
}
