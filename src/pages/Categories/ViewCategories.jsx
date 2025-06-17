import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, StatisticsHeader, Breadcrumb } from "ama-design-system";
import { BarLineGraphTabs } from "../../components/BarLineGraph";
import { RadarGraph } from "../../components/RadarGraph";
import GoodBadTab from "../../components/GoodBadTab/GoodBadTab";
import { useTheme } from "../../context/ThemeContext";
import ContentListWebSites from "../Websites/components/ContentListWebSites";
import { dataRows as dataRowsWebSites } from "../Websites/table.config.jsx";
import {
  barData,
  barOptions,
  dataHeaders as dataHeadersBar,
  columnsOptions as columnsOptionsBar,
  dataList as dataListBar
} from "../../components/BarLineGraph/table.config.jsx";
const ViewCategories = () => {
  const breadcrumbs = [
    {
      children: <Link to="/">Home</Link>
    },
    {
      title: "Categories",
    }
  ]
  const { theme } = useTheme();
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);

  const [selectedWebsite, setSelectedWebsite] = useState(null);
  const [data, setData] = useState(dataRowsWebSites);

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

  return (
    <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb
          darkTheme={theme === 'dark'}
          data={breadcrumbs}
        />
      </div>
      <div>
        <h1>Dados Globais da Categoria</h1>
      <div className="bg-white p-4">
        <ContentListWebSites
          darkTheme={theme === 'dark'}
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
        <h2 className="mb-4">Indicadores globais da Categoria</h2>
        <StatisticsHeader
          darkTheme="light"
          gaugeDescription=""
          gaugeTitle={[
            'Pontuação média'
          ]}
          screenReaderTitle="Indicadores globais da Categoria"
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
        <h2 className="mb-4">Conformidade global da Categoria</h2>
        <StatisticsHeader
          darkTheme={theme === 'dark'}
          gaugeDescription=""
          doubleRow={true}
          gaugeType={null}
          showGauge={false}
          screenReaderTitle="Conformidade global da Categoria"
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
        <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
        <RadarGraph />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
        <GoodBadTab />
      </div>
   
      </div>
    </div>
  );
};

export default ViewCategories;