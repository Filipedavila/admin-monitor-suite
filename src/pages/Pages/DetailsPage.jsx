import React, { useState, useEffect } from "react";
import { Button, StatisticsHeader, Breadcrumb, TableComponent, StatsTable } from "ama-design-system";
import "./style.users.css";
import { useParams } from "react-router-dom";
import { directoriesHeadersPage, dataRowsPage, columnsOptionsPage, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { RadarGraph } from "../../components/RadarGraph/index.jsx";
import GoodBadTab from "../../components/GoodBadTab/GoodBadTab.jsx";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import { BarLineGraphTabs } from "../../components/BarLineGraph/index.jsx";
import { 
  barData,
  barOptions,
  dataHeaders as dataHeadersBar,
  columnsOptions as columnsOptionsBar,
  dataList as dataListBar
 } from "../../components/BarLineGraph/table.config.jsx";
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from "../../config/api.js";
import moment from "moment";
import Indicators from "../../components/Indicators/index.jsx";
import tests from "../../utils/tests.js";
import { useTranslation } from "react-i18next";
import { extractWebsiteContextFromPath } from "../../utils/navigation";

const calculateMatrix = (data) => {
  const matrix = {
    A: { ok: 0, err: 0, war: 0 },
    AA: { ok: 0, err: 0, war: 0 },
    AAA: { ok: 0, err: 0, war: 0 }
  };

  let totalCount = 0;

  data.forEach(item => {
    const level = item.lvl || 'A';
    
    if (matrix[level]) {
      if (item.tdClassName === 'success-cell') {
        matrix[level].ok++;
      } else if (item.tdClassName === 'error-cell') {
        matrix[level].err++;
      } else if (item.tdClassName === 'warning-cell') {
        matrix[level].war++;
      }
      totalCount++;
    }
  });

  return {
    data:{
      infoak: matrix,
      metadata: {
        count_results: totalCount
      }
    }
  };
};

const DetailsPage = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
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
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [data, setData] = useState([
    {
      id: "1",
      title:
        "I found 1 image on the page without the alternative text equivalent.",
      component: (
        <div>
          Check if the alternative text equivalent found in the images provides
          equal information or function as the one performed by the image on the
          page. H37: Using alt attributes on img elements This WCAG 2.1
          technique is related to: Success criteria 1.1.1 (Level A) Notions
          about the SC 1.1.1
        </div>
      ),
      lvl: "AA",
      iconName: "AMA-Middle-Line",
      ele: "test",
      tdClassName: "warning-cell"
    },
  ])

  const [matrixData, setMatrixData] = useState({
    data: {
    infoak: {
      A: { ok: 2, err: 1, war: 0 },
      AA: { ok: 0, err: 0, war: 0 },
      AAA: { ok: 0, err: 0, war: 0 }
    },
      metadata: {
        count_results: 3
      }
    }
  })

  const [listItems, setListItems] = useState([
    { title: 'Pontuação média', value: 8 },
    { title: 'URL', value: "processando..." },
    { title: 'Título', value: "processando..." },
    { title: 'Nº de elementos (x)HTML	', value: "processando..." },
    { title: 'Tamanho da página	', value: "processando..." },
  ]);
  const { pageUrl, id } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

  useEffect(() => {
    const previousPath = localStorage.getItem('previousPath') || '';
    const websiteContext = extractWebsiteContextFromPath(previousPath);
    const pageLink = `/dashboard/pages/view/${encodeURIComponent(pageUrl)}`;
    if (websiteContext) {
      const slugOrName = websiteContext.websiteSlug || encodeURIComponent(websiteContext.websiteName || "");
      setBreadcrumbs([
        { children: <Link to="/dashboard/global">Global</Link> },
        { children: <Link to="/dashboard/websites">Sítios Web</Link> },
        { children: <Link to={`/dashboard/websites/view/${websiteContext.websiteId}/${slugOrName}`}>{websiteContext.websiteName || "Sítio Web"}</Link> },
        { children: <Link to={pageLink}>Páginas</Link> },
        { title: "Detalhes da página" }
      ]);
    } else {
      setBreadcrumbs([
        { children: <Link to="/dashboard/global">Global</Link> },
        { children: <Link to="/dashboard/pages">Páginas</Link> },
        { title: "Detalhes da página" }
      ]);
    }

    const fetchData = async () => {
      const response = await api.get(`/evaluation/${encodeURIComponent(pageUrl)}/${id}`); 
      const result = response.data.result.data;
      setListItems([
        { title: 'Pontuação média', value: result.score },
        { title: 'URL', value: result.tot.info.url},
        { title: 'Título', value: result.tot.info.title },
        { title: 'Nº de elementos (x)HTML	', value: result.tot.info.htmlTags },
        { title: 'Tamanho da página	', value:result.tot.info.size + " bytes"},
      ]);

      const mappedData = Object.keys(result.tot.results).map(item => ({
        id: item.id,
        title: t('TESTS_RESULTS.' +item + '.p'),
        lvl: tests[item].level.toUpperCase(),
        component: (
    <div className="text-start">
            <div  dangerouslySetInnerHTML={{__html: t('TXT_TECHNIQUES.' + tests[item].ref)}} />
            <span>Esta técnica WCAG 2.1 está relacionada com:</span>
            <ul>
              {tests[item].scs.split(',').map(sc => (
                <li className="list-table" key={sc}>Critério de sucesso {sc} <em>(Nível {tests[item].level.toUpperCase()})</em></li>
              ))}
            </ul>
            </div>
        ),
        iconName: tests[item].result === "warning" ? "AMA-Middle-Line" : tests[item].result === "failed" ? "AMA-Wrong-Line" : "AMA-Check-Line",
        ele: tests[item].ele,
        tdClassName: tests[item].result === "warning" ? "warning-cell" : tests[item].result === "failed" ? "error-cell" : "success-cell"
      }));

      setData(mappedData);
      setMatrixData(calculateMatrix(mappedData));

    }
    fetchData();
  }, []);
  return (
    <div>
      <Breadcrumb data={breadcrumbs} />

      <h1>Detalhes da página</h1>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Sumário</h2>
        <Indicators listItems={listItems} />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Matriz de Práticas</h2>
        <StatsTable
        darkTheme={theme}
        data={matrixData}
        ok={"Aceitáveis"}
        warning={"Para ver manualmente"}
        error={"Não aceitáveis"}
        title={" práticas encontradas"}
        caption={"Sumário das práticas avaliadas"}
        type={"Tipo de prática"}
      />
      </div>

      <div className="mt-5 bg-white">
        <h2>Avaliação</h2>
     
        <div className="d-flex justify-content-start align-items-end gap-3">
         <TableComponent 
         data={data} 
         onClick={e => console.log(e)} 
         caption={"Práticas avaliadas"} 
         col1={"Prática encontrada"} 
         col2={"Nível"} 
         col3={"Ver detalhe"} 
         lvlTitle={"Nível: "} 
         imageTitlesCallback={t => ()=>{}} 
         darkTheme={theme} 
         ariaLabels={{
          AA: "duplo ",
          AAA: "triplo ",
          button: "Ver detalhe"
        }} />
        </div>
      </div>
    </div>
  )
}

export default DetailsPage;
