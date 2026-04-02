import { Button, StatisticsHeader, SortingTable } from "@a12e/accessmonitor-ds";
import { BarLineGraphTabs } from "../../../components/BarLineGraph/index.jsx";
import { RadarGraph } from "../../../components/RadarGraph/index.jsx";
import GoodBadTab from "../../../components/GoodBadTab/GoodBadTab.jsx";
import { useState, useEffect, useMemo, memo } from "react";
import { detailsTableHeaders, columnsOptionsDetails, ariaLabels, detailsTable } from "../../Directories/table.config.jsx";
import Indicators from "../../../components/Indicators/index.jsx";
import {api} from "../../../config/api.js";
import { useTranslation } from "react-i18next";
import { headersBarLine } from "../../../components/BarLineGraph/table.config.jsx";
import { ruleset } from "@a12e/accessmonitor-rulesets";
import moment from "moment";
import { downloadCSV, downloadCSVByDirectory } from "../../../utils/utils.js";
const TabGlobalObservatoryComponent = ({ theme, statsTitle, columnsOptionsBar, barDataCopy, barOptionsCopy, dataHeadersBar, dataListBar, headerBarlineBar }) => {
      const [listItems, setListItems] = useState([]);
      const [listItemsGlobal, setListItemsGlobal] = useState([]);
    const [dataList, setDataList] = useState([]);
    const [detailsTableGood, setDetailsTableGood] = useState([]);
    const [detailsTableBad, setDetailsTableBad] = useState([]);
    // Memoize initial empty states
    const initialSuccessCriteria = useMemo(() => ({}), []);
    const [counter, setCounter] = useState(0);
    const [directories, setDirectories] = useState([]);
    const [successCriteriaSuccess, setSuccessCriteriaSuccess] = useState(initialSuccessCriteria);
    const [successCriteriaErrors, setSuccessCriteriaErrors] = useState(initialSuccessCriteria);
    const [barData, setBarData] = useState({
        labels: headersBarLine,
        datasets: [
          {
            type: 'bar',
            label: "Frequência (nº de páginas)",
            data: [1, 2, 3, 1, 0, 0, 0, 0, 10],
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
    const [radarData, setRadarData] = useState([]);
    const { t } = useTranslation();
    useEffect(() => {
        const fetchData = async () => {
           const response = await api.get('/observatory');
          console.log("Observatory:", response.data)
            if (response.status === 200) {
              
            
                setData(response.data);
                const indicators = response.data.result;
                setListItems([
                  { title: 'Pontuação média', value:indicators.score.toFixed(1) },
                  { title: 'Avaliação mais antiga de uma página', value: moment(indicators.oldestPage).format('DD/MM/YYYY') },
                  { title: 'Avaliação mais recente de uma página', value: moment(indicators.recentPage).format('DD/MM/YYYY') },
                  { title: 'Nº de Diretórios', value:indicators.nDirectories },
                  { title: 'Nº de Entidades', value:indicators.nEntities },
                  { title: 'Nº de Sítios Web', value:indicators.nWebsites },
                  { title: 'Nº de Páginas', value: indicators.nPages },
                  { title: 'Nº médio de Páginas por Sítio', value: (indicators.nPages / indicators.nWebsites).toFixed(1) },

                ]);
                setDirectories(Object.values(indicators.directories));
                let websiteNonConforms = 0;
                let websiteConformsA = 0;
                let websiteConformsAA = 0;
                let websiteConformsAAA = 0;
                const computedWebsites = []
                  Object.values(indicators.directories).forEach(directory => {
                    Object.values(directory.websites).forEach(website => {
                      if(computedWebsites.filter(computedWebsite => computedWebsite.id === website.id).length > 0) {
                        return;
                      }
                      computedWebsites.push(website)
                      if (website.pagesWithErrors > 0) {
                        websiteNonConforms++;
                      } else {                        
                        if (website.pagesWithoutErrorsA === 0) {
                          websiteConformsA++;
                        }
                        if (website.pagesWithoutErrorsAA === 0 && website.pagesWithoutErrorsA > 0) {
                          websiteConformsAA++;
                        }
                        if (website.pagesWithoutErrorsAAA === 0 && website.pagesWithoutErrorsAA > 0 && website.pagesWithoutErrorsA > 0) {
                          websiteConformsAAA++;
                        }
                       
                      }                                     
                    });
                  });
                  setListItemsGlobal([
                    { title: 'Sítios Web', value: indicators.nWebsites },
                    { title: 'Sítios Web não conformes', value: websiteNonConforms },
                    { title: 'Sítios Web conformes', value: websiteConformsAAA + websiteConformsAA + websiteConformsA,
                      itemsList: [
                        {title: "Conformidade A", value: websiteConformsA },
                        {title: "Conformidade AA", value: websiteConformsAA},
                        {title: "Conformidade AAA", value: websiteConformsAAA},
                      ]
                    },
                  ]);
                  setBarData({
                    labels: headersBarLine,
                    datasets: [
                      {
                        type: 'bar',
                        label: "Frequência (nº de páginas)",
                        data: indicators.scoreDistributionFrequency,
                        backgroundColor: '#339', // All bars same color
                        categoryPercentage: 1,
                        barPercentage: 1,
                        grouped: true, // For Chart.js 4.x, ensures no grouping/spacing
                      },
                    ],
                  });
                  setRadarData(Object.values(indicators.directories).map(directory =>( {score: directory.score.toFixed(1), domain: directory.name} )));
                  const dataListBarArray = []
                  indicators.scoreDistributionFrequency.map((item, index) => {
                    dataListBarArray.push({
                      range: `[${index + 1} - ${index + 2}[`,
                      frequency: indicators.scoreDistributionFrequency[index],
                      frequency_percent: `${((indicators.scoreDistributionFrequency[index] / indicators.nPages) * 100).toFixed(2)}%`,
                      cumulative: indicators.scoreDistributionFrequency.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0),
                      cumulative_percent: `${((indicators.scoreDistributionFrequency.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0) / indicators.nPages) * 100).toFixed(2)}%`
                    });
                  });
                
                  setDataList(dataListBarArray);
                  setDetailsTableGood(indicators.bestPracticesDistribution);

                  const keysGood = Object.keys(indicators.bestPracticesDistribution.success);
                  const keysErrors = Object.keys(indicators.errorDistribution.errors);
            
                  setDetailsTableGood(Object.values(indicators.bestPracticesDistribution.success).map((item, index)=>({
                    practice: t(`TESTS_RESULTS.${keysGood[index]}.p`, { value: item.n_occurrences }),
                    pages: item.n_pages,
                    occurrences: item.n_occurrences,
                    level: ruleset[keysGood[index]]?.level ?? "N/A"
                  })));
                 
                  setDetailsTableBad(Object.values(indicators.errorDistribution.errors).map((error, index)=>({
                    practice: t(`TESTS_RESULTS.${keysErrors[index]}.p`, { value: error.n_occurrences }),
                    pages: error.n_pages,
                    occurrences: error.n_occurrences.toString().includes("lang") ? "N/A" : error.n_occurrences,
                    level: ruleset[keysErrors[index]]?.level ?? "N/A"
                  })));

                  // Process practices by WCAG Success Criteria
                  const practicesBySuccessCriteria = {
                    success: {},
                    errors: {}
                  };

                  // Process successful practices
                  keysGood.forEach((key, index) => {
                    const testData = ruleset[key];
                    const practiceData = indicators.bestPracticesDistribution.success[key];
                    
                    if (testData && testData.scs && practiceData) {
                      const criteriaList = testData.scs;
     
                      
                      criteriaList.forEach(criteria => {
                        const trimmedCriteria = criteria.trim();
                        if (!practicesBySuccessCriteria.success[trimmedCriteria]) {
                          practicesBySuccessCriteria.success[trimmedCriteria] = [];
                        }
                        practicesBySuccessCriteria.success[trimmedCriteria].push({
                          practice: practiceData.n_occurrences.toString().includes("lang") ? "N/A" : t(`TESTS_RESULTS.${key}.p`, { value: practiceData.n_occurrences }),
                          pages: practiceData.n_pages,
                          occurrences: practiceData.n_occurrences,
                          level: testData.level?.toUpperCase() || 'N/A',
                          websiteCount: practiceData.n_pages
                        });
                      });
                    }
                  });

                  // Process error practices
                  keysErrors.forEach((key, index) => {
                    const testData = ruleset[key];
                    const errorData = indicators.errorDistribution.errors[key];
                    
                    if (testData && testData.scs && errorData) {
                      const criteriaList = testData.scs;
                    
                      
                      criteriaList.forEach(criteria => {
                        const trimmedCriteria = criteria.trim();
                        if (!practicesBySuccessCriteria.errors[trimmedCriteria]) {
                          practicesBySuccessCriteria.errors[trimmedCriteria] = [];
                        }
                        practicesBySuccessCriteria.errors[trimmedCriteria].push({
                          practice: errorData.n_occurrences.toString().includes("lang") ? "N/A" : t(`TESTS_RESULTS.${key}.p`, { value: errorData.n_occurrences }),
                          pages: errorData.n_pages,
                          occurrences: errorData.n_occurrences.toString().includes("lang") ? "N/A" : errorData.n_occurrences,
                          level: testData.level?.toUpperCase() || 'N/A',
                          websiteCount: errorData.n_pages
                        });
                      });
                    }
                  });

                  // Format data for WCAG Success Criteria display
                  const formatSuccessCriteriaData = (practicesData) => {
                    const formatted = {};
                    Object.keys(practicesData).sort().forEach(criteria => {
                      const practices = practicesData[criteria];
                      formatted[criteria] = {
                        criteriaCode: criteria,
                        practiceCount: practices.length,
                        practices: practices
                      };
                    });
                    return formatted;
                  };

                  const formattedSuccessData = formatSuccessCriteriaData(practicesBySuccessCriteria.success);
                  const formattedErrorData = formatSuccessCriteriaData(practicesBySuccessCriteria.errors);

                  setSuccessCriteriaSuccess(formattedSuccessData);
                  setSuccessCriteriaErrors(formattedErrorData);

            } else {
              
                console.log(response);
            }
        }
        fetchData();
    }, []);
    const [data, setData] = useState( [
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
          downloadCSVByDirectory(
            directories.map((d) =>  d.name),
            "Observatório - " + new Date().toLocaleDateString(),
          );
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
          <p>Para exportar todos os dados do Observatório à data de hoje, pressione o botão "Exportar CSV" abaixo.</p>
          
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
        <BarLineGraphTabs 
          columnsOptions={columnsOptionsBar}
          barData={barData}
          barOptions={barOptionsCopy}
          dataHeaders={dataHeadersBar}
          dataList={dataList}
          headerBarline={headerBarlineBar}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Mancha Gráfica da Acessibilidade</h3>
        <RadarGraph labelDataSet="Pontuação por diretório" websites={radarData} />
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