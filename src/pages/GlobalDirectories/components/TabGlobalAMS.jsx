// ⚠️ This version replaces your debounced local processing with a Web Worker
// Make sure to create a file: `src/workers/aggregation.worker.js` (see below)

import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { Button, StatisticsHeader, SortingTable } from "@a12e/accessmonitor-ds";
import { BarLineGraphTabs } from "../../../components/BarLineGraph/index.jsx";
import { RadarGraph } from "../../../components/RadarGraph/index.jsx";
import GoodBadTab  from "../../../components/GoodBadTab/GoodBadTab.jsx";
import { detailsTableHeaders, columnsOptionsDetails, ariaLabels, detailsTable } from "../../Directories/table.config.jsx";
import Indicators from "../../../components/Indicators/index.jsx";
import { headersBarLine, barOptions } from "../../../components/BarLineGraph/table.config.jsx";
import { api } from "../../../config/api.js";
import { useTranslation } from "react-i18next";
import { downloadCSVByDirectory, groupPracticesBySuccessCriteria } from "../../../utils/utils.js";
import moment from "moment";
const TabGlobalAMS = ({
  theme,
  columnsOptionsBar,
  barDataCopy,
  statsTitle,
  barOptionsCopy,
  dataHeadersBar,
  dataListBarParams,
  headerBarlineBar
}) => {
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
  const [initialDataRadar, setInitialDataRadar] = useState([]);
  const [initialDataListDetails, setInitialDataListDetails] = useState([]);
  const [initialDataListDetailsBad, setInitialDataListDetailsBad] = useState([]);
  const [initialSuccessCriteriaSuccess, setInitialSuccessCriteriaSuccess] = useState([]);
  const [initialSuccessCriteriaErrors, setInitialSuccessCriteriaErrors] = useState([]);
  const [error, setError] = useState(null);

  const fetchDataGlobalAMS = useCallback(async () => {
    try {
        const response = await api.get('/totals');
        const indicators = response.data.result;
        setInitialListItems([
          { title: 'Pontuação média', value: indicators.averageScore.toFixed(1) },
          { title: 'Avaliação mais antiga de uma página', value: moment(indicators.oldestEvaluation).format('DD/MM/YYYY') },
          { title: 'Avaliação mais recente de uma página', value: moment(indicators.mostRecentEvaluation).format('DD/MM/YYYY') },
          { title: 'Nº de Diretórios', value: indicators.directories },
          { title: 'Nº de Entidades', value: indicators.entities },
          { title: 'Nº de Sítios Web', value: indicators.websites },
          { title: 'Nº de Páginas', value: indicators.pages },
          { title: 'Nº médio de Páginas por Sítio', value: (indicators.pages / indicators.websites).toFixed(1) },
        ]);
        setInitialListItemsGlobal([
          { title: 'Sítios Web', value: indicators.websites },
          { title: 'Sítios Web não conformes', value: indicators.nonConformingWebsites},
          { title: 'Sítios Web conformes', value: indicators.conformingWebsites,
            itemsList: [
              { title: 'Conformidade A', value: indicators.levelAConformingWebsites },
              { title: 'Conformidade AA', value: indicators.levelAAConformingWebsites },
              { title: 'Conformidade AAA', value: indicators.levelAAAConformingWebsites },
            ]
          },
        ]);

        setInitialBarDataStructure({
          labels: headersBarLine,
          datasets: [
            {
              type: 'bar',
              label: "Frequência (nº de páginas)",
              data: Object.values(indicators.scoreRanges),
              backgroundColor: '#339',
              categoryPercentage: 1,
              barPercentage: 1,
              grouped: true,
            }
          ]
        });
        const dataListBarArray = []
        const scoreRanges = Object.values(indicators.scoreRanges);
        scoreRanges.map((item, index) => {
          const totalPages = Object.values(indicators.scoreRanges).reduce((acc, curr) => acc + curr, 0);
          dataListBarArray.push({
            range: `[${index + 1} - ${index + 2}[`,
            frequency: scoreRanges[index],
            frequency_percent: `${((scoreRanges[index] / totalPages) * 100).toFixed(2)}%`,
            cumulative: scoreRanges.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0),
            cumulative_percent: `${((scoreRanges.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0) / totalPages) * 100).toFixed(2)}%`
          });
        });
        
        setDataListBar(dataListBarArray);
        const directoriesKeys = Object.keys(indicators.directoryAverageScores);
        setDirectories(directoriesKeys);
        const radarData = Object.values(indicators.directoryAverageScores).map((directory, index) => ({averageScore: directory, domain: directoriesKeys[index]}));
        setInitialDataRadar(radarData);
      } catch (err) {
        console.log(err);
        setError('Erro ao carregar diretórios');
      }
  }, []);

  const fetchPratices = useCallback(async () => {
      try {
        const response = await api.get('/totals/practices');
        const practices = response.data.result.practiceTable;
        console.log("pratices", response.data);
        setInitialDataListDetails(practices.filter(item => item.isGoodPractice).map(
          item => ({
            practice:  t(`TESTS_RESULTS.${item.practice}.p`, { value: item.elements }) ,
            pages: item.pages,
            occurrences: item.elements,
            level: item.level.toUpperCase()
          })
        ));

        setInitialDataListDetailsBad(practices.filter(item => !item.isGoodPractice).map(
            item => ({
              practice:   t(`TESTS_RESULTS.${item.practice}.p`, { value: item.elements }) ,
              pages: item.pages,
              occurrences: item.elements,
              level: item.level.toUpperCase()
            })
        ));
  
        const formattedSuccessData = groupPracticesBySuccessCriteria(practices.filter(item => item.isGoodPractice));
        const formattedErrorData = groupPracticesBySuccessCriteria(practices.filter(item => !item.isGoodPractice));
        setInitialSuccessCriteriaSuccess(formattedSuccessData);
        setInitialSuccessCriteriaErrors(formattedErrorData);
        //?  t(`TESTS_RESULTS.${item.practice}`, { value: item.elements }) : (`TESTS_RESULTS.${item.practice}.p`, { value: item.elements })
      } catch (err) {
        console.log(err);
      }
  }, [t]);

  useEffect(() => {
    fetchDataGlobalAMS();
    fetchPratices();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [fetchDataGlobalAMS, fetchPratices]);

  const handleExportCSV = async () => {
    try {
      downloadCSVByDirectory(
        directories.map((d) => d),
        "Global AMS - " + new Date().toLocaleDateString()
      );
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
          disabled={directories.length === 0}
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
        <BarLineGraphTabs
          columnsOptions={columnsOptionsBar}
          barData={initialBarDataStructure}
          barOptions={barOptions}
          dataHeaders={dataHeadersBar}
          dataList={dataListBar}
          headerBarline={headerBarlineBar}
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Mancha Gráfica da Acessibilidade</h3>
        <RadarGraph labelDataSet="Pontuação por diretório" websites={initialDataRadar}  />
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
