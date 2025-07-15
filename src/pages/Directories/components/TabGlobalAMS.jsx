import { Button, StatisticsHeader, SortingTable } from "ama-design-system";
import { BarLineGraphTabs } from "../../../components/BarLineGraph";
import { RadarGraph } from "../../../components/RadarGraph";
import GoodBadTab  from "../../../components/GoodBadTab/GoodBadTab.jsx";
import { useState } from "react";
import { detailsTableHeaders, columnsOptionsDetails, ariaLabels, detailsTable } from "../table.config.jsx";
import Indicators from "../../../components/Indicators";
export const TabGlobalAMS = ({
    theme,
    columnsOptionsBar,
    barDataCopy,
    statsTitle,
    barOptionsCopy,
    dataHeadersBar,
    dataListBar,
    headerBarlineBar
}) => {
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
          id:Date.now() +Math.random().toString(36).substr(2, 9),
          name: "Comissão Nacional de Eleições",
          type: "AcessMonitor",
        },
      ]);

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
    return (
        <div>
            
      <h2>AMS</h2>
      <p>Abaixo encontra a listagem de todos os Directórios registados no AdminMonitorSuite, num total de 38 diretórios.</p>

      <div className="content bg-white">
        <div>
          <h2>Exportação de dados</h2>
          <p>Para exportar todos os dados do AMS à data de hoje, pressione o botão "Exportar CSV" abaixo.</p>
          
        </div>
        <div className="d-flex justify-content-start align-items-end">
        <Button
            darkTheme={theme}
            text={"Exportar CSV"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
          />
        </div>
      </div>
      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Indicadores globais do AMS</h3>
        <Indicators listItems={listItems}/>
        {/*<StatisticsHeader
          darkTheme={theme}
          gaugeDescription=""
          gaugeTitle={[
            'Pontuação média'
          ]}
          tag="h3"
          screenReaderTitle="Indicadores globais do AMS"
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
        <h3 className="mb-4">Conformidade global do AMS</h3>
        <Indicators listItems={listItemsGlobal}/>
        {/*<StatisticsHeader
         darkTheme={theme}          gaugeDescription=""
          doubleRow={true}
          gaugeType={null}
          showGauge={false}
          tag="h3"
          screenReaderTitle="Conformidade global do AMS"
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
          gaugeTitle={["Conformidade global do AMS"]}
        />*/}
      </div>

      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Distribuição das pontuações AccessMonitor no universo do AMS</h3>
        <BarLineGraphTabs 
          columnsOptions={columnsOptionsBar}
          barData={barDataCopy}
          barOptions={barOptionsCopy}
          dataHeaders={dataHeadersBar}
          dataList={dataListBar}
          headerBarline={headerBarlineBar}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h3 className="mb-4">Mancha Gráfica da Acessibilidade</h3>
        <RadarGraph />
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