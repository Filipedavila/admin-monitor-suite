import { useState } from "react";
import { Button, StatisticsHeader, Breadcrumb } from "ama-design-system";
import "./style.users.css";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { RadarGraph } from "../../components/RadarGraph/index.jsx";
import GoodBadTab from "../../components/GoodBadTab/GoodBadTab.jsx";
import { Link, useParams } from "react-router-dom";
import { BarLineGraphTabs } from "../../components/BarLineGraph/index.jsx";
import { 
  barData,
  barOptions,
  dataHeaders as dataHeadersBar,
  columnsOptions as columnsOptionsBar,
  dataList as dataListBar
 } from "../../components/BarLineGraph/table.config.jsx";
import { useTheme } from "../../context/ThemeContext";
import ContentListWebSites from "../Websites/components/ContentListWebSites.jsx";
import { dataRows as dataRowsWebSites } from "../Websites/table.config.jsx";

const ViewDirectories = () => {
  const { directoryName } = useParams();
  const { theme } = useTheme();
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
    }, {
      subtitle: "Conformidade AAA",
      subtitle2: "Sem erros de nível A + AA + AAA"
    }

  ])
  const breadcrumbs = [
    { children: <Link to="/">Global</Link> },
    { children: <Link to="/directories">Diretórios</Link> },
    { title: directoryName }
  ];
  const [data, setData] = useState(dataRowsWebSites)
  const [checkboxesSelected, setCheckboxesSelected] = useState([])
  const barDataCopy = JSON.parse(JSON.stringify(barData));
  const barOptionsCopy = JSON.parse(JSON.stringify(barOptions));
  return (

    <div>
      <Breadcrumb data={breadcrumbs} />

      <h1>Dados Globais do Diretório - {directoryName}</h1>
      <p>Abaixo encontra a listagem de todos os Directórios registados no AdminMonitorSuite, num total de 38 diretórios.</p>

      <div className="content bg-white">
        <ContentListWebSites
          checkboxesSelected={checkboxesSelected}
          setCheckboxesSelected={setCheckboxesSelected}
          data={data}
          setData={setData}
        />

        
      </div>
    

      <div className="bg-white p-4 mt-5">
        <div>
          <h2>Exportação de dados</h2>
          <p>Para exportar todos os dados do Observatório à data de hoje, pressione o botão "Exportar CSV" abaixo.</p>
        </div>
        <div className="d-flex bg-white justify-content-end align-items-end">
          <Button
            text={"Exportar CSV"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
            />
        </div>
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Indicadores globais do Diretório</h2>
        <StatisticsHeader
          darkTheme="light"
          gaugeDescription=""
          gaugeTitle={[
            'Pontuação média'
          ]}
          screenReaderTitle="Indicadores globais do Diretório"
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
        <h2 className="mb-4">Conformidade global do Diretório</h2>
        <StatisticsHeader
          darkTheme={theme === 'dark'}
          gaugeDescription=""
          doubleRow={true}
          gaugeType={null}
          showGauge={false}
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
          statsTitles={statsTitle}
          subtitle="Metadados"
          title="Estatísticas"
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo do Diretório</h2>
        <BarLineGraphTabs
          columnsOptions={columnsOptionsBar}
          barData={barDataCopy}
          barOptions={barOptionsCopy}
          dataHeaders={dataHeadersBar}
          dataList={dataListBar}
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

export default ViewDirectories;