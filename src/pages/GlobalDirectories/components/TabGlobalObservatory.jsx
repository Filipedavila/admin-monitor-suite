import { Button, SortingTable, Tabs } from "@a12e/accessmonitor-ds";
import { useNavigate } from "react-router-dom";
import { ScoreDistributionRadar } from "../../../components/ScoreDistributionRadar";
import { AccessibleBarChart } from "../../../components/AccessibleBarChart";
import { useState, useEffect, useMemo, memo } from "react";
import { detailsTableHeaders, columnsOptionsDetails, ariaLabels } from "../../Directories/table.config.jsx";
import Indicators from "../../../components/Indicators/index.jsx";
import {api} from "../../../config/api.js";
import { useTranslation } from "react-i18next";
import { headersBarLine } from "../../../components/BarLineGraph/table.config.jsx";
import { buildGlobalAnalyticsView } from "../../../utils/utils.js";
import { downloadAnalyticsExport } from "../../../services/analytics.js";
const TabGlobalObservatoryComponent = ({ theme, barOptionsCopy }) => {
    const navigate = useNavigate();
      const [listItems, setListItems] = useState([]);
      const [listItemsGlobal, setListItemsGlobal] = useState([]);
    const [dataList, setDataList] = useState([]);
    const [detailsTableGood, setDetailsTableGood] = useState([]);
    const [detailsTableBad, setDetailsTableBad] = useState([]);
    // Memoize initial empty states
    const initialSuccessCriteria = useMemo(() => ({}), []);
    const [successCriteriaSuccess, setSuccessCriteriaSuccess] = useState(initialSuccessCriteria);
    const [successCriteriaErrors, setSuccessCriteriaErrors] = useState(initialSuccessCriteria);
    const [barData, setBarData] = useState({
        labels: headersBarLine,
        datasets: [
          {
            type: 'bar',
            label: "Frequência (nº de páginas)",
            data: [],
            backgroundColor: '#339', // All bars same color
            categoryPercentage: 1,
            barPercentage: 1,
            grouped: true, // For Chart.js 4.x, ensures no grouping/spacing
          },
        ],
        options: {
          responsive: false, // disables auto-resize
          maintainAspectRatio: false, // allows custom aspect ratio
        }
    });
    const { t } = useTranslation();
    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await api.get('/analytics/global');
            const view = buildGlobalAnalyticsView(response.data.data.observatory, t);

            setListItems(view.listItems);
            setListItemsGlobal(view.listItemsGlobal);

            setBarData({
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
                },
              ],
            });
            setDataList(view.dataListBar);

            setDetailsTableGood(view.detailsGood);
            setDetailsTableBad(view.detailsBad);

            const toCriteriaObject = (groups) =>
              Object.fromEntries(groups.map(g => [g.successCriteria, {
                criteriaCode: g.successCriteria,
                practiceCount: g.practices.length,
                practices: g.practices.map(p => ({
                  practice: t(`TESTS_RESULTS.${p.title_key}.p`, { value: p.websiteCount }),
                  websiteCount: p.websiteCount,
                })),
              }]));
            setSuccessCriteriaSuccess(toCriteriaObject(view.successCriteriaGood));
            setSuccessCriteriaErrors(toCriteriaObject(view.successCriteriaBad));
          } catch (err) {
            console.log(err);
          }
        }
        fetchData();
    }, [t]);

    const [data] = useState( [
        {
          id:Date.now()+Math.random().toString(36).substr(2, 9),
          name: "Portal Mais Transparência",
          type: "MyMonitor",
        },
        {
          id:Date.now()+Math.random().toString(36).substr(2, 9),
          name: "Instituto da Segurança Social, I.P. - Portal Seg Social com o <title>",
          type: "MyMonitor",
        },
        {
          id:Date.now()+Math.random().toString(36).substr(2, 9),
          name: "Portal do SNS 24",
          type: "AcessMonitor",
        },
        {
          id:Date.now()+Math.random().toString(36).substr(2, 9),
          name: "Comissão Nacional de Eleições",
          type: "AcessMonitor",
        }
      ]);
      const handleExportCSV = async () => {
        try {
          await downloadAnalyticsExport({ resource: "global", format: "csv", context: "obs" });
        } catch (error) {
          console.error("Error exporting CSV:", error);
        }
      }
    return (
        <div>
         
      <h2>Observatório</h2>
      <p>Abaixo encontra a listagem de todos os Directórios registados no AdminMonitorSuite, num total de 38 diretórios.</p>

      <div className="content bg-white">
        <div>
          <h3>Exportação de dados</h3>
          <p>Para exportar todos os dados do Observatório à data de hoje, pressione o botão &quot;Exportar CSV&quot; abaixo.</p>
          
        </div>
        <div className="d-flex justify-content-start align-items-end">
        <Button
            darkTheme={theme}
            text={"Exportar CSV"}
            disabled={data.length === 0}
            className="btn-primary"
            onClick={handleExportCSV}
          />
        </div>
      </div>
      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Indicadores globais do Observatório</h3>
        <Indicators listItems={listItems} />
        {/* <StatisticsHeader
          darkTheme={theme}
          gaugeDescription=""
          gaugeTitle={[
            'Pontuação média'
          ]}
          tag="h3"
          screenReaderTitle="Indicadores globais do Observatório"
          gaugeType=""
          newestPage="Avaliação mais recente de uma página:"
          oldestPage="Avaliação mais antiga de uma página:"
          stats={{
            oldestPage: '16 de outubro de 2023',
            recentPage: '16 de outubro de 2023',
            score: '8.5',
            statsTable: [
              1,
              24,
              26,
              1423,
              45
            ]
          }}
          statsTitles={[
            'Diretórios',
            'Entidades',
            'Sítios Web',
            'Páginas',
            'Páginas por sítio'
          ]}
          subtitle="Metadados"
          title="Estatísticas"
        />*/}

      </div> 
      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Conformidade global do Observatório</h3>
          <Indicators listItems={listItemsGlobal} />
          {/* <StatisticsHeader
         darkTheme={theme}          gaugeDescription=""
          doubleRow={true}
          gaugeType={null}
          showGauge={false}
          tag="h3"
          screenReaderTitle="Conformidade global do Observatório"
          stats={{
            recentPage: "",
            oldestPage: "",
            score: 9,
            statsTable:
              [
                42,
                0,
                42,
                0,
                0,
                0
              ]
          }}
          statsTitles={statsTitle}
          subtitle="Metadados"
          title="Estatísticas"
        />*/}
      </div> 

      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Distribuição das pontuações AccessMonitor no universo do Observatório</h3>
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
                  data={barData}
                  options={barOptionsCopy}
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
                  caption="Distribuição das pontuações AccessMonitor no universo do Observatório"
                  headers={[[
                    { type: "Text", nRow: 1, name: "Intervalo de pontuação", property: "range" },
                    { type: "Text", nRow: 1, name: "Nº de páginas", property: "frequency", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "% Frequência", property: "frequency_percent", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Acumulado", property: "cumulative", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "% Acumulado", property: "cumulative_percent", justifyCenter: true },
                  ]]}
                  dataList={dataList}
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
        <ScoreDistributionRadar dataListBar={dataList} theme={theme} caption="Mancha gráfica da acessibilidade — frequência de páginas por nota (Observatório)" />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
       <SortingTable
            hasSort={false}
            headers={detailsTableHeaders || []}
            dataList={detailsTableGood.filter(item => !(item.occurrences.toString().includes("lang") || item.practice.toString().includes("lang")))}
            columnsOptions={columnsOptionsDetails || {}}
            darkTheme={theme}
            pagination={false}
            links={false}
            ariaLabels={ariaLabels || {}}
            caption="Distribuição detalhada das melhores práticas"
            setDataList={() => {}}
            nextPage={() => {}}
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[]}
            iconsAltTexts={[]}
            paginationButtonsTexts={[]}
            project=""
            setCheckboxesSelected={() => {}}
          />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das piores práticas</h2>
       <SortingTable
            hasSort={false}
            headers={detailsTableHeaders || []}
            dataList={detailsTableBad.filter(item => !(item.occurrences.toString().includes("lang") || item.practice.toString().includes("lang")))}
            columnsOptions={columnsOptionsDetails || {}}
            darkTheme={theme}
            pagination={false}
            links={false}
            ariaLabels={ariaLabels || {}}
            caption="Distribuição detalhada das piores práticas"
            setDataList={() => {}}
            nextPage={() => {}}
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[]}
            iconsAltTexts={[]}
            paginationButtonsTexts={[]}
            project=""
            setCheckboxesSelected={() => {}}
          />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Práticas por Critério de Sucesso WCAG 2.1</h2>
        <div>
          <h3 style={{ fontWeight: 700, marginTop: 32 }}>Boas práticas</h3>
          {Object.keys(successCriteriaSuccess).length > 0 ? (
            Object.entries(successCriteriaSuccess)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([criteriaCode, criteriaData]) => (
                <div key={criteriaCode} style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "1.1em" }}>
                    Critério de sucesso {criteriaCode} ({criteriaData.practiceCount})
                  </div>
                  <ul style={{ marginTop: 8 }}>
                    {criteriaData.practices.map((practice, index) => (
                      <li key={index}>
                        <div dangerouslySetInnerHTML={{__html: `${practice.practice}: ${practice.websiteCount} sítio/s web`}}></div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          ) : (
            <div style={{ marginTop: 16 }}>
              <p>Carregando boas práticas...</p>
            </div>
          )}

          <h3 style={{ fontWeight: 700, marginTop: 32 }}>Más práticas</h3>
          {Object.keys(successCriteriaErrors).length > 0 ? (
            Object.entries(successCriteriaErrors)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([criteriaCode, criteriaData]) => (
                <div key={criteriaCode} style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "1.1em" }}>
                    Critério de sucesso {criteriaCode} ({criteriaData.practiceCount})
                  </div>
                  <ul style={{ marginTop: 8 }}>
                    {criteriaData.practices.map((practice, index) => (
                      <li key={index}>
                        <div dangerouslySetInnerHTML={{__html: `${practice.practice} : ${practice.websiteCount} sítio/s web`}}></div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))
          ) : (
            <div style={{ marginTop: 16 }}>
              <p>Carregando más práticas...</p>
            </div>
          )}
        </div>
      </div>
        </div>
    )
}

// Export memoized component to prevent unnecessary re-renders
export const TabGlobalObservatory = memo(TabGlobalObservatoryComponent);