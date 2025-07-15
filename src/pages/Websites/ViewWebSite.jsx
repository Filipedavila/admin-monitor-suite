import { useState, useEffect } from "react";
import { Button, StatisticsHeader, Breadcrumb, SortingTable } from "ama-design-system";
import "./style.users.css";
import { RadarGraph } from "../../components/RadarGraph/index.jsx";
import GoodBadTab from "../../components/GoodBadTab/GoodBadTab.jsx";
import { Link, useLocation, useParams } from "react-router-dom";
import { BarLineGraphTabs } from "../../components/BarLineGraph/index.jsx";
import ContentListPages from "../Pages/components/ContentListPage.jsx";
import {
  dataHeaders as dataHeadersBad,
  columnsOptions as columnsOptionsBad,
  dataRows as dataRowsBad,
  itemsPaginationText,
  nameOfIcons,
  nItemsPerPageText,
  paginationButtonsTexts,
} from "../../components/GoodBadTab/table.config.jsx";
import { barOptionsDark, dataRows, horizontalData, optionsHorizontalBar, optionsHorizontalBarDark } from "./table.config.jsx";
import {
  barData,
  barOptions,
  dataHeaders as dataHeadersBar,
  columnsOptions as columnsOptionsBar,
  dataList as dataListBar
} from "../../components/BarLineGraph/table.config.jsx";
import { useTheme } from '../../context/ThemeContext';
import {
  dataRows as dataRowsBar
} from "../Pages/table.config.jsx";
import { useTranslation } from "react-i18next";
import Indicators from "../../components/Indicators";
const ViewWebSites = () => {
  const { t } = useTranslation();
  const { websiteName, directoryName } = useParams();
  const { theme } = useTheme();
  const location = useLocation();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);
  const listItems = [
    { title: 'Pontuação média', value: '7.4' },
    { title: 'Avaliação mais antiga de uma página', value: '15 de dezembro de 2020' },
    { title: 'Avaliação mais recente de uma página', value: '21 de maio de 2025' },
    { title: 'Nº de páginas recolhidas(avaliadas)', value: '124(124)' },
  ] 
  const listItemsGlobal = [
    { title: 'Páginas Avaliadas', value: '124' },
    { title: 'Páginas Não Conformes', value: '0' },
    { title: 'Páginas Conformes', value: '124',
      itemsList: [
        { title: 'Conformidade A', value: '346 (33,3%)' },
        { title: 'Conformidade AA', value: '346 (33,3%)' },
        { title: 'Conformidade AAA', value: '346 (33,3%)' },
      ]
    },
  
  ]

  const [breadcrumbs, setBreadcrumbs] = useState([
    { children: <Link to="/dashboard/global">Global</Link> },
  ]);


  const [data, setData] = useState(dataRowsBar)
  const [dataBad, setDataBad] = useState(dataRowsBad);
  const [checkboxesSelected, setCheckboxesSelected] = useState([])

  useEffect(() => {
    if (localStorage.getItem('previousPath')?.includes('directories')) {
      const previousDirectory = localStorage.getItem('previousPath').split('/').pop();
      setBreadcrumbs([
        { children: <Link to="/dashboard/global">Global</Link> },
        { children: <Link to="/dashboard/directories">Diretórios</Link> },
        { children: <Link to={`/dashboard/directories/view/${previousDirectory}`}>Diretório</Link> },
        { title: websiteName }
      ]);
    } else if(localStorage.getItem('previousPath')?.includes('entities'))  {
      const previousEntity = localStorage.getItem('previousPath').split('/').pop();
    
      setBreadcrumbs([
        { children: <Link to="/dashboard/global">Global</Link> },
        { children: <Link to="/dashboard/entities">Entidades</Link> },
        { children: <Link to={`/dashboard/entities/view/${previousEntity}`}>Entidade</Link> },
        { title: websiteName }
      ]);
    } else if(localStorage.getItem('previousPath')?.includes('categories')) {
      const previousCategory = localStorage.getItem('previousPath').split('/').pop();
      setBreadcrumbs([
        { children: <Link to="/dashboard/global">Global</Link> },
        { children: <Link to="/dashboard/categories">Categorias</Link> },
        { children: <Link to={`/dashboard/categories/view/${previousCategory}`}>Categoria</Link> },
        { title: websiteName }
      ]);
    } else {
      setBreadcrumbs([
        { children: <Link to="/dashboard/global">Global</Link> },
        { children: <Link to="/dashboard/websites">Sítios Web</Link> },
        { title: websiteName }
      ]);
    }
  }, []);
  return (

    <div>
      <Breadcrumb data={breadcrumbs} />

      <h1>{t('WEBSITES_PAGE.LIST.title', {websiteName})}</h1>

      <div className="content bg-white">
      <h2>{t('WEBSITES_PAGE.LIST.subtitle', {websiteName})}</h2>
        <ContentListPages
          checkboxesSelected={checkboxesSelected}
          setCheckboxesSelected={setCheckboxesSelected}
          data={data}
          setData={setData}
        />

      </div>
      <div className="mt-5 bg-white d-flex flex-column gap-3">
        <h2>{t('WEBSITES_PAGE.LIST.export_data')}</h2>
        <p>{t('WEBSITES_PAGE.LIST.export_data_description', {websiteName})}</p>
        <div className="d-flex justify-content-start align-items-end">
          <Button
            darkTheme={theme}
            text={t('WEBSITES_PAGE.LIST.export_csv')}
            className="btn-primary"
            onClick={() => console.log(t('WEBSITES_PAGE.LIST.export_csv'))}
          />
        </div>
      </div>

      <div className="mt-5 bg-white">
        <h2 className="mb-4">Indicadores globais do sítio web</h2>
        <Indicators listItems={listItems}/>
        {/*<StatisticsHeader
          darkTheme={theme}
          gaugeDescription=""
          gaugeTitle={[
            'Pontuação média'
          ]}
          tag="h3"
          screenReaderTitle="Indicadores globais do sítio web"
          gaugeType=""
          newestPage="Avaliação mais recente de uma página:"
          oldestPage="Avaliação mais antiga de uma página:"
          stats={{
            oldestPage: '16 de outubro de 2023',
            recentPage: '16 de outubro de 2023',
            score: '8.5',
            statsTable: [
              1
            ]
          }}
          statsTitles={[
            'Número de páginas recolhidas',
          ]}
          subtitle="Metadados"
          title="Estatísticas"
        />*/}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Conformidade do sítio web</h2>
        <Indicators listItems={listItemsGlobal}/>
        {/*<StatisticsHeader
          darkTheme={theme}
          gaugeDescription=""
          doubleRow={true}
          gaugeType={null}
          tag="h3"
          showGauge={false}
          screenReaderTitle="Conformidade do sítio web"
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
        <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo das 37 páginas analisadas no sítio web</h2>
        <BarLineGraphTabs
          barData={barData}
          barOptions={ theme === "light" ? barOptions : barOptionsDark}
          columnsOptions={columnsOptionsBar}
          dataHeaders={dataHeadersBar}
          dataList={dataListBar}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Boas Práticas de acessibilidade encontradas no sítio web        </h2>
        <BarLineGraphTabs
          barData={horizontalData}
          barOptions={theme === "light" ? optionsHorizontalBar: optionsHorizontalBarDark}
          columnsOptions={columnsOptionsBad}
          dataHeaders={dataHeadersBad}
          dataList={dataBad}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Más Práticas de acessibilidade encontradas no sítio web        </h2>
        <BarLineGraphTabs
          barData={horizontalData}
          barOptions={theme === "light" ? optionsHorizontalBar: optionsHorizontalBarDark}
          columnsOptions={columnsOptionsBad}
          dataHeaders={dataHeadersBad}
          dataList={dataBad}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
        <RadarGraph />
      </div>
      <div className="mt-5 bg-white p-4 d-flex flex-column gap-4">
        <h2 className="mb-4">Top 5 dos erros mais frequentes por nível de conformidade
        </h2>

        
        <SortingTable
          darkTheme={theme}
          headers={[
            [
              { type: "Text", name: "Nível", property: "level" },
              { type: "Text", name: "Prática", property: "practice" },
              { type: "Text", name: "Descrição", property: "description" }
            ]
          ]}
          dataList={[
            { level: "A", practice: "Texto Alternativo", description: "Todas as imagens têm texto alternativo." },
            { level: "AA", practice: "Contraste de Cores", description: "Contraste suficiente entre texto e fundo." },
            { level: "AAA", practice: "Navegação por Teclado", description: "Todo o site pode ser navegado por teclado." }
          ]}
          columnsOptions={{
            level: { type: "Text", center: true, bold: true },
            practice: { type: "Text", center: false, bold: false },
            description: { type: "Text", center: false, bold: false }
          }}
          pagination={false}
          caption="Top 5 dos erros de Nível A"
        />
              
        <SortingTable
          darkTheme={theme}
          headers={[
            [
              { type: "Text", name: "Nível", property: "level" },
              { type: "Text", name: "Prática", property: "practice" },
              { type: "Text", name: "Descrição", property: "description" }
            ]
          ]}
          dataList={[
            { level: "A", practice: "Texto Alternativo", description: "Todas as imagens têm texto alternativo." },
            { level: "AA", practice: "Contraste de Cores", description: "Contraste suficiente entre texto e fundo." },
            { level: "AAA", practice: "Navegação por Teclado", description: "Todo o site pode ser navegado por teclado." }
          ]}
          columnsOptions={{
            level: { type: "Text", center: true, bold: true },
            practice: { type: "Text", center: false, bold: false },
            description: { type: "Text", center: false, bold: false }
          }}
          pagination={false}
          caption="Top 5 dos erros de Nível AA"
        />

        <SortingTable
          darkTheme={theme}
          headers={[
            [
              { type: "Text", name: "Nível", property: "level" },
              { type: "Text", name: "Prática", property: "practice" },
              { type: "Text", name: "Descrição", property: "description" }
            ]
          ]}
          dataList={[
            { level: "A", practice: "Texto Alternativo", description: "Todas as imagens têm texto alternativo." },
            { level: "AA", practice: "Contraste de Cores", description: "Contraste suficiente entre texto e fundo." },
            { level: "AAA", practice: "Navegação por Teclado", description: "Todo o site pode ser navegado por teclado." }
          ]}
          columnsOptions={{
            level: { type: "Text", center: true, bold: true },
            practice: { type: "Text", center: false, bold: false },
            description: { type: "Text", center: false, bold: false }
          }}
          pagination={false}
          caption="Top 5 dos erros de Nível AAA"
        />
      </div>
      <div className="mt-5 bg-white p-4 d-flex flex-column gap-4">
        <h2 className="mb-4">Top 5 das boas práticas mais frequentes por nível de conformidade

        </h2>

        <SortingTable
          darkTheme={theme}
          headers={[
            [
              { type: "Text", name: "Nível", property: "level" },
              { type: "Text", name: "Prática", property: "practice" },
              { type: "Text", name: "Descrição", property: "description" }
            ]
          ]}
          dataList={[
            { level: "A", practice: "Texto Alternativo", description: "Todas as imagens têm texto alternativo." },
            { level: "AA", practice: "Contraste de Cores", description: "Contraste suficiente entre texto e fundo." },
            { level: "AAA", practice: "Navegação por Teclado", description: "Todo o site pode ser navegado por teclado." }
          ]}
          columnsOptions={{
            level: { type: "Text", center: true, bold: true },
            practice: { type: "Text", center: false, bold: false },
            description: { type: "Text", center: false, bold: false }
          }}
          pagination={false}
          caption="Top 5 das boas práticas de Nível A"
        />
        <SortingTable
          darkTheme={theme}
          headers={[
            [
              { type: "Text", name: "Nível", property: "level" },
              { type: "Text", name: "Prática", property: "practice" },
              { type: "Text", name: "Descrição", property: "description" }
            ]
          ]}
          dataList={[
            { level: "A", practice: "Texto Alternativo", description: "Todas as imagens têm texto alternativo." },
            { level: "AA", practice: "Contraste de Cores", description: "Contraste suficiente entre texto e fundo." },
            { level: "AAA", practice: "Navegação por Teclado", description: "Todo o site pode ser navegado por teclado." }
          ]}
          columnsOptions={{
            level: { type: "Text", center: true, bold: true },
            practice: { type: "Text", center: false, bold: false },
            description: { type: "Text", center: false, bold: false }
          }}
          pagination={false}
          caption="Top 5 das boas práticas de Nível AA"
        />
        <SortingTable
          darkTheme={theme}
          headers={[
            [
              { type: "Text", name: "Nível", property: "level" },
              { type: "Text", name: "Prática", property: "practice" },
              { type: "Text", name: "Descrição", property: "description" }
            ]
          ]}
          dataList={[
            { level: "A", practice: "Texto Alternativo", description: "Todas as imagens têm texto alternativo." },
            { level: "AA", practice: "Contraste de Cores", description: "Contraste suficiente entre texto e fundo." },
            { level: "AAA", practice: "Navegação por Teclado", description: "Todo o site pode ser navegado por teclado." }
          ]}
          columnsOptions={{
            level: { type: "Text", center: true, bold: true },
            practice: { type: "Text", center: false, bold: false },
            description: { type: "Text", center: false, bold: false }
          }}
          pagination={false}
          caption="Top 5 das boas práticas de Nível AAA"
        />
      </div>
      <div className="mt-5 bg-white">
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

export default ViewWebSites;