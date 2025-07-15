import { useState } from "react";
import { Button, StatisticsHeader, Breadcrumb, Tabs } from "ama-design-system";
import "./style.users.css";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { Link } from "react-router-dom";
import { 
    dataHeaders as dataHeadersBar, 
    columnsOptions as columnsOptionsBar, 
    dataList as dataListBar, 
    headersBarLine as headerBarlineBar,
    barData as barDataBar,
    barOptions as barOptionsBar
  } from "../../components/BarLineGraph/table.config.jsx";
import { useTheme } from "../../context/ThemeContext";
import { TabGlobalAMS } from "./components/TabGlobalAMS.jsx";
import { TabGlobalObservatory } from "./components/TabGlobalObservatory.jsx";
import { barOptionsDark } from "../Websites/table.config.jsx";
import { useTranslation } from 'react-i18next';
const GlobalDirectories = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
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
    { children: <Link to="/">Início</Link> },
    { title: "Dados Globais do Observatório" }
  ];
  const [data, setData] = useState(dataRows)
  const [checkboxesSelected, setCheckboxesSelected] = useState([])
const barDataCopy = JSON.parse(JSON.stringify(barDataBar));
const barOptionsCopy = JSON.parse(JSON.stringify(barOptionsBar));
const tabs = [
  {
    eventKey: "ams",
    title: "AMS",
    component: <TabGlobalAMS 
        theme={theme}
        columnsOptionsBar={columnsOptionsBar}
        barDataCopy={barDataCopy}
        barOptionsCopy={theme === "light" ? barOptionsCopy : barOptionsDark}
        dataHeadersBar={dataHeadersBar}
        dataListBar={dataListBar}
        headerBarlineBar={headerBarlineBar}
        statsTitle={statsTitle}
    />
  },
  {
    eventKey: "observatory",
    title: "Observatório",
    component: <TabGlobalObservatory  
        theme={theme}
        columnsOptionsBar={columnsOptionsBar}
        barDataCopy={barDataCopy}
        barOptionsCopy={theme === "light" ? barOptionsCopy : barOptionsDark}
        dataHeadersBar={dataHeadersBar}
        dataListBar={dataListBar}
        headerBarlineBar={headerBarlineBar}
        statsTitle={statsTitle}
    />
  }
  
]
  return (

    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
      <h1>Dados Globais</h1>
      <Tabs tabs={tabs} defaultActiveKey="ams" />
    </div>
  )
}

export default GlobalDirectories;