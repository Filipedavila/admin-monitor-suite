// ⚠️ This version replaces your debounced local processing with a Web Worker
// Make sure to create a file: `src/workers/aggregation.worker.js` (see below)

import { useEffect, useState, useRef, useCallback } from "react";
import { Button, SortingTable, Tabs } from "@a12e/accessmonitor-ds";
import { useNavigate } from "react-router-dom";
import { ScoreDistributionRadar } from "../../../components/ScoreDistributionRadar";
import { AccessibleBarChart } from "../../../components/AccessibleBarChart";
import { detailsTableHeaders, columnsOptionsDetails, ariaLabels } from "../../Directories/table.config.jsx";
import Indicators from "../../../components/Indicators/index.jsx";
import { headersBarLine } from "../../../components/BarLineGraph/table.config.jsx";
import { api } from "../../../config/api.js";
import { useTranslation } from "react-i18next";
import { buildGlobalAnalyticsView } from "../../../utils/utils.js";
import { downloadAnalyticsExport } from "../../../services/analytics.js";
const TabGlobalAMS = ({
  theme
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const workerRef = useRef(null);

  const [initialListItems, setInitialListItems] = useState([
    { title: 'Pontuação média', value: 'processando...' },
    { title: 'Avaliação mais antiga de uma página', value: 'processando...' },
    { title: 'Avaliação mais recente de uma página', value: 'processando...' },
    { title: 'Nº de Diretórios', value: 'processando...' },
    { title: 'Nº de Entidades', value: 'processando...' },
    { title: 'Nº de Sítios Web', value: 'processando...' },
    { title: 'Nº de Páginas', value: 'processando...' },
    { title: 'Nº médio de Páginas por Sítio', value: 'processando...' },
  ]);

  const [initialListItemsGlobal, setInitialListItemsGlobal] = useState([
    { title: 'Sítios Web', value: 'processando...' },
    { title: 'Sítios Web não conformes', value: 'processando...' },
    { title: 'Sítios Web conformes', value: 'processando...',
      itemsList: [
        { title: 'Conformidade A', value: 'processando...' },
        { title: 'Conformidade AA', value: 'processando...' },
        { title: 'Conformidade AAA', value: 'processando...' },
      ]
    },
  ]);

  const [initialBarDataStructure, setInitialBarDataStructure] = useState({
    labels: headersBarLine,
    datasets: [
      {
        type: 'bar',
        label: "Frequência (nº de páginas)",
        data: [],
        backgroundColor: '#339',
        categoryPercentage: 1,
        barPercentage: 1,
        grouped: true,
      }
    ]
  });
  const [dataListBar, setDataListBar] = useState([]);
  const [directories, setDirectories] = useState([]);
  const [initialDataListDetails, setInitialDataListDetails] = useState([]);
  const [initialDataListDetailsBad, setInitialDataListDetailsBad] = useState([]);
  const [initialSuccessCriteriaSuccess, setInitialSuccessCriteriaSuccess] = useState([]);
  const [initialSuccessCriteriaErrors, setInitialSuccessCriteriaErrors] = useState([]);
  const [error, setError] = useState(null);

  const fetchDataGlobalAMS = useCallback(async () => {
    try {
        const response = await api.get('/analytics/global');
        const view = buildGlobalAnalyticsView(response.data.data.ams, t);

        setInitialListItems(view.listItems);
        setInitialListItemsGlobal(view.listItemsGlobal);

        setInitialBarDataStructure({
          labels: headersBarLine,
          datasets: [
            {
              type: 'bar',
              label: "Frequência (nº de páginas)",
              data: view.scoreDistribution,
              backgroundColor: '#339',
              categoryPercentage: 1,
              barPercentage: 1,
              grouped: true,
            }
          ]
        });
        setDataListBar(view.dataListBar);

        setInitialDataListDetails(view.detailsGood);
        setInitialDataListDetailsBad(view.detailsBad);

        setInitialSuccessCriteriaSuccess(view.successCriteriaGood);
        setInitialSuccessCriteriaErrors(view.successCriteriaBad);
      } catch (err) {
        console.log(err);
        setError('Erro ao carregar dados globais do AMS');
      }
  }, [t]);

  // Nº de diretórios — mantido no endpoint antigo,
  // pois /analytics/global não devolve indicadores por diretório.
  const fetchDirectoriesRadar = useCallback(async () => {
      try {
        const response = await api.get('/totals');
        const indicators = response.data.result;
        const directoriesKeys = Object.keys(indicators.directoryAverageScores);
        setDirectories(directoriesKeys);
      } catch (err) {
        console.log(err);
      }
  }, []);

  useEffect(() => {
    fetchDataGlobalAMS();
    fetchDirectoriesRadar();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [fetchDataGlobalAMS, fetchDirectoriesRadar]);

  const handleExportCSV = async () => {
    try {
      await downloadAnalyticsExport({ resource: "global", format: "csv", context: "ams" });
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  }

  return (
    <div>
      <h2>AMS</h2>
      <p>
        Abaixo encontra a listagem de todos os Directórios registados no AdminMonitorSuite,
        num total de {directories.length} diretórios.
      </p>

      {error && <div className="alert alert-danger">Erro: {error}</div>}

      <div className="content bg-white">
        <h2>Exportação de dados</h2>
        <Button
          darkTheme={theme}
          text="Exportar CSV"
          className="btn-primary"
          onClick={handleExportCSV}
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Indicadores globais do AMS</h3>
        <Indicators listItems={initialListItems}/>
      </div>

      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Conformidade global do AMS</h3>
        <Indicators listItems={initialListItemsGlobal}/>
      </div>

      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Distribuição das pontuações AccessMonitor</h3>
        <Tabs
          defaultActiveKey="chart"
          darkTheme={theme}
          tabs={[
            {
              eventKey: "chart",
              title: "Gráfico",
              component: (
                <AccessibleBarChart
                  ariaLabel="Histograma das pontuações do AccessMonitor"
                  data={initialBarDataStructure}
                  options={{ responsive: true, maintainAspectRatio: true }}
                />
              ),
            },
            {
              eventKey: "table",
              title: "Tabela",
              component: (
                <SortingTable
                  darkTheme={theme}
                  hasSort={false}
                  pagination={false}
                  caption="Distribuição das pontuações AccessMonitor"
                  headers={[[
                    { type: "Text", nRow: 1, name: "Intervalo de pontuação", property: "range" },
                    { type: "Text", nRow: 1, name: "Nº de páginas", property: "frequency", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "% Frequência", property: "frequency_percent", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Acumulado", property: "cumulative", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "% Acumulado", property: "cumulative_percent", justifyCenter: true },
                  ]]}
                  dataList={dataListBar}
                  columnsOptions={{
                    range: { type: "Text", center: false, bold: true },
                    frequency: { type: "Text", center: true, bold: false },
                    frequency_percent: { type: "Text", center: true, bold: false },
                    cumulative: { type: "Text", center: true, bold: false },
                    cumulative_percent: { type: "Text", center: true, bold: false },
                  }}
                />
              ),
            },
          ]}
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Mancha Gráfica da Acessibilidade</h3>
        <Button
          darkTheme={theme}
          text="Ir para a lista de sítios web"
          className="btn-primary mb-4"
          onClick={() => navigate("/dashboard/websites")}
        />
        <ScoreDistributionRadar dataListBar={dataListBar} theme={theme} caption="Mancha gráfica da acessibilidade — frequência de páginas por nota (AMS)" />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
        <SortingTable
          headers={detailsTableHeaders || []}
          dataList={initialDataListDetails}
          columnsOptions={columnsOptionsDetails || {}}
          darkTheme={theme}
          pagination={false}
          links={false}
          ariaLabels={ariaLabels || {}}
          caption="Distribuição detalhada das melhores práticas"
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das piores práticas</h2>
        <SortingTable
          headers={detailsTableHeaders || []}
          dataList={initialDataListDetailsBad || []}
          columnsOptions={columnsOptionsDetails || {}}
          darkTheme={theme}
          pagination={false}
          links={false}
          ariaLabels={ariaLabels || {}}
          caption="Distribuição detalhada das piores práticas"
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Práticas por Critério de Sucesso WCAG 2.1</h2>
        <h3 style={{ fontWeight: 700, marginTop: 32 }}>Boas práticas</h3>
        {initialSuccessCriteriaSuccess.map((data, index) => (
          <div key={index} style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600 }}>{`Critério de sucesso ${data.successCriteria}`}</div>
            <ul style={{ marginTop: 8 }}>
              {data.practices.map((p, i) => (
                <li key={i}>
                  <div dangerouslySetInnerHTML={{__html: `${t(`TESTS_RESULTS.${p.title_key}.p`, { value: p.websiteCount })}: <b>${p.websiteCount} sítio/s web</b>`}}></div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <h3 style={{ fontWeight: 700, marginTop: 32 }}>Más práticas</h3>
        {initialSuccessCriteriaErrors.map((data, index) => (
          <div key={index} style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600 }}>{`Critério de sucesso ${data.successCriteria}`}</div>
            <ul style={{ marginTop: 8 }}>
              {data.practices.map((p, i) => (

                <li key={i}>
                  <div dangerouslySetInnerHTML={{__html: `${t(`TESTS_RESULTS.${p.title_key}.p`, { value: p.websiteCount })}: <b>${p.websiteCount} sítio/s web</b>`}}></div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabGlobalAMS;
