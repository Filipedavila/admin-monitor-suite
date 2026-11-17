import { useState, useEffect } from "react";
import qs from "qs";
import { Breadcrumb, TableComponent, StatsTable } from "@a12e/accessmonitor-ds";
import "./style.users.css";
import { useParams } from "react-router-dom";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from "../../config/api.js";
import Indicators from "../../components/Indicators/index.jsx";
import { ruleset } from  "@a12e/accessmonitor-rulesets";
import { useTranslation } from "react-i18next";
import { getEffectiveNavigationContext } from "../../utils/navigation";
import { calculateTotalElements } from "../../utils/utils";

// `ruleset` is keyed by internal rule ids (e.g. "title_06"), each with a `.test`
// field holding the test name (e.g. "titleOk"). The `/nodes` evaluation endpoint
// keys its results by that test name, so build a reverse lookup to resolve the
// rule definition (level, ref, scs) and the original rule key for i18n lookups.
const ruleByTest = Object.entries(ruleset).reduce((acc, [key, def]) => {
  if (def?.test && !acc[def.test]) {
    acc[def.test] = { key, ...def };
  }
  return acc;
}, {});

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
      A: { ok: 0, err: 0, war: 0 },
      AA: { ok: 0, err: 0, war: 0 },
      AAA: { ok: 0, err: 0, war: 0 }
    },
      metadata: {
        count_results: 0
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
    const currentPath = location.pathname;
    const navContext = getEffectiveNavigationContext(currentPath);
    const pageLink = `/dashboard/pages/view/${encodeURIComponent(pageUrl)}`;
    
    if (navContext) {
      if (navContext.type === 'website') {
        const { websiteId, websiteSlug, websiteName } = navContext.data;
        const slugOrName = websiteSlug || encodeURIComponent(websiteName || "");
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/websites">Sítios Web</Link> },
          { children: <Link to={`/dashboard/websites/view/${websiteId}/${slugOrName}`}>{websiteName || "Sítio Web"}</Link> },
          { children: <Link to={pageLink}>Páginas</Link> },
          { title: "Detalhes da página" }
        ]);
      } else if (navContext.type === 'directory') {
        const { directoryName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/directories">Diretórios</Link> },
          { children: <Link to={`/dashboard/directories/view/${encodeURIComponent(directoryName)}`}>{directoryName}</Link> },
          { children: <Link to={pageLink}>Páginas</Link> },
          { title: "Detalhes da página" }
        ]);
      } else if (navContext.type === 'entity') {
        const { entityName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/entities">Entidades</Link> },
          { children: <Link to={`/dashboard/entities/view/${encodeURIComponent(entityName)}`}>{entityName}</Link> },
          { children: <Link to={pageLink}>Páginas</Link> },
          { title: "Detalhes da página" }
        ]);
      } else if (navContext.type === 'category') {
        const { categoryName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/categories">Categorias</Link> },
          { children: <Link to={`/dashboard/categories/view/${encodeURIComponent(categoryName)}`}>{categoryName}</Link> },
          { children: <Link to={pageLink}>Páginas</Link> },
          { title: "Detalhes da página" }
        ]);
      }
    } else {
      setBreadcrumbs([
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/pages">Páginas</Link> },
        { title: "Detalhes da página" }
      ]);
    }

    const fetchData = async () => {
      let websiteId;
      let pageId;
      let pageUrlValue = pageUrl;
      try {
        const pagesQuery = qs.stringify({ filters: { searchTerm: pageUrl } });
        const pagesResponse = await api.get(`/pages?${pagesQuery}`);
        const page = pagesResponse.data.data.find(item => item.url === pageUrl) ?? pagesResponse.data.data[0];
        websiteId = page?.websiteId ?? page?.website?.id;
        pageId = page?.id;
        pageUrlValue = page?.url ?? pageUrl;
      } catch (error) {
        console.error("Erro ao localizar a página", error);
      }

      let pageSize;
      try {
        const legacyResponse = await api.get(`/evaluation/${encodeURIComponent(pageUrl)}/${id}`);
        const legacyResult = legacyResponse.data.result.data;
        pageSize = legacyResult?.tot?.info?.size;
      } catch (error) {
        console.error("Erro ao carregar dados legados da avaliação (tamanho da página)", error);
      }

      if (!websiteId || !pageId) {
        return;
      }

      try {
        const summaryResponse = await api.get(`/evaluations/website/${websiteId}/page/${pageId}/evaluation/${id}`);
        const summary = summaryResponse.data?.data ?? summaryResponse.data;
        const elementCount = summary.tagCount && typeof summary.tagCount === "object"
          ? calculateTotalElements(summary.tagCount)
          : Number(summary.tagCount) || 0;

        setListItems([
          { title: 'Pontuação média', value: summary.score },
          { title: 'URL', value: pageUrlValue },
          { title: 'Título', value: summary.pageTitle },
          { title: 'Nº de elementos (x)HTML	', value: elementCount },
          { title: 'Tamanho da página	', value: pageSize != null ? pageSize + " bytes" : "-" },
        ]);
      } catch (error) {
        console.error("Erro ao carregar o sumário da avaliação da página", error);
      }

      try {
        const nodesResponse = await api.get(`/evaluations/website/${websiteId}/page/${pageId}/evaluation/${id}/nodes`);
        const nodesPayload = nodesResponse.data?.data ?? nodesResponse.data;

        const mappedData = Object.keys(nodesPayload).map(itemKey => {
          const entries = nodesPayload[itemKey] || [];
          // nodesPayload is keyed by test name (e.g. "titleOk"); resolve the matching
          // ruleset entry (and its own rule key, e.g. "title_06") through ruleByTest.
          const testData = ruleByTest[itemKey] || {};
          const ruleKey = testData.key ?? itemKey;
          const level = testData.level?.toUpperCase() ?? '';
          const resultType = entries.some(entry => entry.verdict === 'failed')
            ? 'failed'
            : entries.some(entry => entry.verdict === 'warning')
              ? 'warning'
              : 'passed';
          const displayValue = entries.reduce((sum, entry) => sum + (entry.elements?.length || 0), 0);
          const title = displayValue > 1 ? '.p' : '.s';
          const successCriteria = testData.scs ? testData.scs : [];

          return {
            id: itemKey,
            title: <div dangerouslySetInnerHTML={{__html: t('TESTS_RESULTS.' + ruleKey + title, {value: displayValue})}} />,
            lvl: level,
            component: (
              <div className="text-start">
                <div dangerouslySetInnerHTML={{ __html: t('TXT_TECHNIQUES.' + (testData.ref ?? '')) }} />
                {successCriteria.length > 0 && (
                  <>
                    <span>Esta técnica WCAG 2.1 está relacionada com:</span>
                    <ul>
                      {successCriteria.map(sc => (
                        <li className="list-table" key={sc}>
                          Critério de sucesso {sc} <em>(Nível {level})</em>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ),
            iconName: resultType === "warning" ? "AMA-Middle-Line" : resultType === "failed" ? "AMA-Wrong-Line" : "AMA-Check-Line",
            ele: ruleKey,
            tdClassName: resultType === "warning" ? "warning-cell" : resultType === "failed" ? "error-cell" : "success-cell"
          };
        });
        setData(mappedData);
        setMatrixData(calculateMatrix(mappedData));
      } catch (error) {
        console.error("Erro ao carregar a matriz de práticas e a tabela de avaliação da página", error);
      }
    }
    fetchData();
  }, [pageUrl, id, t]);
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
            onClick={(e) => {navigate(`/dashboard/pages/detailed/${encodeURIComponent(pageUrl)}/${e}/${id}`)}} 
            data={data} 
            caption={"Práticas avaliadas"} 
            col1={"Prática encontrada"} 
            col2={"Nível"} 
            col3={"Ver detalhe"} 
            lvlTitle={"Nível: "} 
            imageTitlesCallback={() => ()=>{}} 
            darkTheme={theme} 
            ariaLabels={{ 
              AA: "duplo ",
              AAA: "triplo ",
              button: "Ver detalhe"
            }} 
          />
        </div>
      </div>
    </div>
  )
}

export default DetailsPage;
