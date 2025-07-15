import { useState } from "react";
import { Button, StatisticsHeader, Breadcrumb, SortingTable } from "ama-design-system";
import "./style.users.css";
import { RadarGraph } from "../../components/RadarGraph/index.jsx";
import { Link, useParams, useLocation } from "react-router-dom";
import { BarLineGraphTabs } from "../../components/BarLineGraph/index.jsx";
import { 
  barData,
  barOptions,
  dataHeaders as dataHeadersBar,
  columnsOptions as columnsOptionsBar,
  dataList as dataListBar,
 
 } from "../../components/BarLineGraph/table.config.jsx";

import {
   columnsOptionsDetails,
  detailsTableHeaders,
  ariaLabels,
  detailsTable
} from "./table.config.jsx";
import { useTheme } from "../../context/ThemeContext";
import ContentListWebSites from "../Websites/components/ContentListWebSites.jsx";
import { barOptionsDark, dataRows as dataRowsWebSites } from "../Websites/table.config.jsx";
import { useTranslation } from "react-i18next"; 
import Indicators from "../../components/Indicators/index.jsx";
import { useEffect } from "react";

const ViewDirectories = () => {
  const location = useLocation();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);
  const { directoryName } = useParams();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const listItems = [
    { title: 'Pontuação média', value: '7.4' },
    { title: 'Avaliação mais antiga de uma página', value: '15 de dezembro de 2020' },
    { title: 'Avaliação mais recente de uma página', value: '21 de maio de 2025' },
    { title: 'Nº de Diretórios', value: '1186' },
    { title: 'Nº de Entidades', value: '2076' },
    { title: 'Nº de Sítios Web', value: '124257' },
    { title: 'Nº de Páginas', value: '124257' },
    { title: 'Nº médio de Páginas por Sítio', value: '60' },
  ]   
  const listItemsGlobal = [
    { title: 'Sítios Web', value: '2076' },
    { title: 'Sítios Web não conformes', value: '0' },
    { title: 'Sítios Web conformes', value: '2076',
      itemsList: [
        { title: 'Conformidade A', value: '346 (33,3%)' },
        { title: 'Conformidade AA', value: '346 (33,3%)' },
        { title: 'Conformidade AAA', value: '346 (33,3%)' },
      ]
    },

  ]
  const [statsTitle, setWebsiteStatsTitle] = useState([
    { subtitle: 'Sítios Web', subtitle2: "" },
    { subtitle: 'Sítios Web não conformes', subtitle2: "" },
    { subtitle: 'Sítios Web conformes', subtitle2: "" },
    {
      subtitle: "Conformidade A",
      subtitle2: "Sem erros de nível A"
    },
    {
      subtitle: "Conformidade AA",
      subtitle2: "Sem Erros de Nível A + AA"
    }, 
    {
      subtitle: "Conformidade AAA",
      subtitle2: "Sem erros de nível A + AA + AAA"
    }
  ])
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Global</Link> },
    { children: <Link to="/dashboard/directories">Diretórios</Link> },
    { title: "Directório" }
  ];
  const [data, setData] = useState(dataRowsWebSites || [])
  const [checkboxesSelected, setCheckboxesSelected] = useState([])
  const barDataCopy = JSON.parse(JSON.stringify(barData || {}));
  const barOptionsCopy = JSON.parse(JSON.stringify(barOptions || {}));
  return (

    <div>
      <Breadcrumb data={breadcrumbs || []} />

      <h1>{t('DIRECTORIES_PAGE.LIST.title', { directoryName })}</h1>

      <div>
        <ContentListWebSites
          title={t('DIRECTORIES_PAGE.LIST.subtitle', { directoryName })}
          checkboxesSelected={checkboxesSelected || []}
          setCheckboxesSelected={setCheckboxesSelected}
          data={data || []}
          setData={setData}
        />

        
      </div>
    

      <div className="bg-white mt-5">
        <div>
          <h2>{t('DIRECTORIES_PAGE.LIST.export_data')}</h2>
          <p>{t('DIRECTORIES_PAGE.LIST.export_data_description', {directoryName})}</p>
        </div>
        <div className="d-flex justify-content-start align-items-end">
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.export_csv')}
            className="btn-primary"
            onClick={() => console.log(t('DIRECTORIES_PAGE.LIST.export_csv'))}
            />
        </div>
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">{t('DIRECTORIES_PAGE.LIST.global_indicators')}</h2>
        <Indicators listItems={listItems}/>
        {/* <StatisticsHeader
          darkTheme={theme}
          gaugeDescription=""
          gaugeTitle={[t('STATISTICS.gauge.label')]}
          screenReaderTitle={t('DIRECTORIES_PAGE.LIST.global_indicators')}
          gaugeType=""
          tag="h3"
          newestPage={t('STATISTICS.newest_page_updated')}
          oldestPage={t('STATISTICS.oldest_page_updated')}
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
            t('DIRECTORIES_PAGE.LIST.title_list'),
            t('ENTITIES_PAGE.LIST.title_list'),
            t('WEBSITES_PAGE.LIST.title_list'),
            t('PAGES_PAGE.LIST.title'),
            t('STATISTICS.average_page')
          ] || []}
          subtitle={t('STATISTICS.subtitle')}
          title={t('STATISTICS.title')}
        />
        */}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Conformidade global do Diretório</h2>
        <Indicators listItems={listItemsGlobal}/>
      {  /*<StatisticsHeader
          darkTheme={theme}
          gaugeDescription=""
          doubleRow={true}
          gaugeType={null}
          showGauge={false}
          tag="h3"
          screenReaderTitle="Conformidade global do Diretório"
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
          statsTitles={statsTitle || []}
          subtitle="Metadados"
          title="Estatísticas"
        />*/}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo do Diretório</h2>
        <BarLineGraphTabs
          columnsOptions={columnsOptionsBar}
          barData={barDataCopy}
          barOptions={theme === "light" ? barOptionsCopy : barOptionsDark}
          dataHeaders={dataHeadersBar}
          dataList={dataListBar}
          darkTheme={theme}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
        <RadarGraph darkTheme={theme}/>
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
       <SortingTable
            hasSort={false}
            headers={detailsTableHeaders || []}
            dataList={detailsTable || []}
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
            dataList={detailsTable || []}
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
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: "1.1em" }}>Critério de sucesso 1.1.1 (6)</div>
            <ul style={{ marginTop: 8 }}>
              <li>
                Elementos <code>&lt;button&gt;</code> com nome acessível: <b>29 sítio/s web</b>
              </li>
              <li>
                Não há elementos com o atributo <code>aria-hidden</code> com conteúdo focável: <b>24 sítio/s web</b>
              </li>
              <li>
                Valores de estados e propriedades ARIA permitidos: <b>24 sítio/s web</b>
              </li>
              <li>
                Atributos <code>aria-*</code> respeitam a especificação: <b>28 sítio/s web</b>
              </li>
              <li>
                Atributo <code>aria-controls</code> com valor que corresponde a um id de um elemento: <b>1 sítio/s web</b>
              </li>
              <li>
                Atributos autocomplete válidos: <b>1 sítio/s web</b>
              </li>
            </ul>
           
          </div>

          <h3 style={{ fontWeight: 700, marginTop: 32 }}>Más práticas</h3>
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 600, fontSize: "1.1em" }}>Critério de sucesso 1.1.1 (1)</div>
            <ul style={{ marginTop: 8 }}>
              <li>
                Atributo <code>aria-controls</code> com valor que não corresponde a um id de um elemento: <b>1 sítio/s web</b>
              </li>
            </ul>
         
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewDirectories;