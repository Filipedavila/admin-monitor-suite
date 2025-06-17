import { Button, StatisticsHeader } from "ama-design-system";
import { BarLineGraphTabs } from "../../../components/BarLineGraph";
import { RadarGraph } from "../../../components/RadarGraph";
import GoodBadTab  from "../../../components/GoodBadTab/GoodBadTab.jsx";
import { useState } from "react";
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
    return (
        <div>
            
      <h2>AMS</h2>
      <p>Abaixo encontra a listagem de todos os Directórios registados no AdminMonitorSuite, num total de 38 diretórios.</p>

      <div className="content bg-white">
        <div className="bg-white p-1">
          <h2>Exportação de dados</h2>
          <p>Para exportar todos os dados do AMS à data de hoje, pressione o botão "Exportar CSV" abaixo.</p>
          
        </div>
        <div className="d-flex justify-content-end align-items-end">
        <Button
            text={"Exportar CSV"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
          />
        </div>
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Indicadores globais do AMS</h2>
        <StatisticsHeader
          darkTheme={theme}
          gaugeDescription=""
          gaugeTitle={[
            'Pontuação média'
          ]}
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
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Conformidade global do AMS</h2>
        <StatisticsHeader
         darkTheme={theme}          gaugeDescription=""
          doubleRow={true}
          gaugeType={null}
          showGauge={false}
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
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo do AMS</h2>
        <BarLineGraphTabs 
          columnsOptions={columnsOptionsBar}
          barData={barDataCopy}
          barOptions={barOptionsCopy}
          dataHeaders={dataHeadersBar}
          dataList={data}
          headerBarline={headerBarlineBar}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
        <RadarGraph />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
        <GoodBadTab />
      </div>
        </div>
    )
}