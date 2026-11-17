import { useState, useEffect, useMemo, useCallback, memo, useRef } from "react";
import { sortFields } from "../Pages/table.config.jsx";
import { useServerSort } from "../../hooks/useServerSort";
import qs from "qs";
import { Button, Breadcrumb, SortingTable, Tabs } from "@a12e/accessmonitor-ds";
import "./style.users.css";
import "../../components/AccessibleBarChart/AccessibleBarChart.css";
import { Link, useLocation, useParams } from "react-router-dom";
import { Bar } from "react-chartjs-2";
import { ScoreDistributionRadar } from "../../components/ScoreDistributionRadar";
import { AccessibleBarChart } from "../../components/AccessibleBarChart";
import ContentListPages from "../Pages/components/ContentListPage.jsx";
import { barOptionsDark, barOptions } from "./table.config.jsx";
import { barData } from "../../components/BarLineGraph/table.config.jsx";
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from "react-i18next";
import Indicators from "../../components/Indicators";
import { api } from "../../config/api";
import { deletePages, getDeletePagesErrorKey, getObservatoryFeedback, isPageInObservatory, togglePagesObservatory } from "../../services/pages";
import moment from "moment";
import {ruleset, translations} from "@a12e/accessmonitor-rulesets";
import { downloadAnalyticsExport } from "../../services/analytics.js";
import { calculateTotalElements as calculateEvaluationElementCount, scoreRangeLabel } from "../../utils/utils.js";
import { useEvaluationState } from "../../utils/evaluationEvents.js";
import { evaluationStatusHtml } from "../../components/EvaluationStatus";
import { Modal } from "../../components/Modal";
import {
  getEffectiveNavigationContext,
  getWebsiteOriginFromState,
  getWebsiteOriginTrail,
  setWebsiteNavigationContext,
} from "../../utils/navigation";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";
import { usePermissions } from "../../context/AuthContext";

const LABEL_WIDTH = 320;

function HtmlLabelBarChart({ data }) {
  const overlayRef = useRef(null);
  const chartRef = useRef(null);
  const buttonRefs = useRef([]);
  const [barRects, setBarRects] = useState([]);

  const plugin = useRef({
    id: 'htmlLabels',
    afterDraw(chart) {
      const overlay = overlayRef.current;
      if (!overlay) return;
      const yScale = chart.scales.y;
      if (!yScale) return;
      overlay.innerHTML = '';
      (chart.data.labels ?? []).forEach((label, i) => {
        const y = yScale.getPixelForTick(i);
        const el = document.createElement('div');
        el.innerHTML = label;
        Object.assign(el.style, {
          position: 'absolute',
          top: `${y - 24}px`,
          left: '0',
          width: `${LABEL_WIDTH - 16}px`,
          fontSize: '1rem',
          lineHeight: '1.5',
          textAlign: 'right',
          paddingRight: '8px',
        });
        overlay.appendChild(el);
      });

      const meta = chart.getDatasetMeta(0);
      if (!meta?.data?.length) return;
      const next = meta.data.map((element, i) => ({
        i,
        left: Math.min(element.x ?? 0, element.base ?? 0),
        top: Math.max(0, (element.y ?? 0) - (element.height ?? 20) / 2),
        width: Math.max(Math.abs((element.x ?? 0) - (element.base ?? 0)), 4),
        height: Math.max(element.height ?? 20, 4),
      }));
      setBarRects(prev =>
        prev.length === next.length && prev.every((r, i) =>
          r.left === next[i].left && r.top === next[i].top
        ) ? prev : next
      );
    }
  }).current;

  const showBar = useCallback((i) => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setActiveElements([{ datasetIndex: 0, index: i }]);
    chart.tooltip.setActiveElements([{ datasetIndex: 0, index: i }], { x: 0, y: 0 });
    chart.update('none');
  }, []);

  const clearBar = useCallback(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setActiveElements([]);
    chart.tooltip.setActiveElements([], { x: 0, y: 0 });
    chart.update('none');
  }, []);

  const handleKeyDown = (e, idx) => {
    const total = barRects.length;
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      buttonRefs.current[(idx + 1) % total]?.focus();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      buttonRefs.current[(idx - 1 + total) % total]?.focus();
    }
  };

  const BAR_HEIGHT = 84;
  const count = data?.labels?.length ?? 0;
  const chartHeight = count * BAR_HEIGHT + 60;

  const chartOptions = useMemo(() => ({
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    layout: { padding: { left: LABEL_WIDTH } },
    plugins: { legend: { display: false } },
    scales: {
      x: { title: { display: true, text: 'Nº de Ocorrências' } },
      y: {
        ticks: { display: false },
        grid: { display: false },
        barThickness: 24,
      },
    },
  }), []);

  return (
    <div role="group" aria-label="Gráfico de barras de práticas de acessibilidade" style={{ position: 'relative', height: chartHeight }}>
      <div
        ref={overlayRef}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 1 }}
      />
      <Bar ref={chartRef} data={data} options={chartOptions} plugins={[plugin]} aria-hidden="true" />
      {barRects.map(({ i, left, top, width, height }) => (
        <button
          key={i}
          ref={el => { buttonRefs.current[i] = el; }}
          className="chart-bar-btn"
          tabIndex={0}
          aria-label={`${data.labels?.[i] ?? `Barra ${i + 1}`}: ${data.datasets?.[0]?.data?.[i] ?? ''} ocorrências`}
          onFocus={() => showBar(i)}
          onBlur={clearBar}
          onKeyDown={e => handleKeyDown(e, i)}
          style={{ position: 'absolute', left, top, width, height, zIndex: 2 }}
        />
      ))}
    </div>
  );
}

const ViewWebSitesComponent = () => {
  const { t } = useTranslation();
  const { canEdit, canDelete } = usePermissions();
  const { websiteName, id } = useParams();
  const { theme } = useTheme();
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([
    { children: <Link to="/dashboard/home">Início</Link> },
  ]);
  const [dataBad, setDataBad] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [listItems, setListItems] = useState([]);
  const [listItemsGlobal, setListItemsGlobal] = useState([]);
  const [barDataDynamic, setBarDataDynamic] = useState(barData);
  const [dataListBar, setDataListBar] = useState([]);
  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange } = useServerSort(sortFields, () => setCurrentPage(1));
  // Issue #60: Using only allPagesData for client-side sorting/pagination
  const [allPagesData, setAllPagesData] = useState([]);
  const { pages: livePages, completedTick } = useEvaluationState();
  const pageRows = useMemo(
    () => allPagesData.map((row) => ({ ...row, EvaluationStatus: evaluationStatusHtml(livePages.get(row.id), row.Evaluated) })),
    [allPagesData, livePages]
  );
  const [horizontalDataGood, setHorizontalDataGood] = useState(
    {
      labels: [],
      datasets: [
        {
          label: "Nº de Páginas",
          type: 'bar',
          data: [],
          backgroundColor: "green",
          borderWidth: 0,
        }
      ]
    }
  );
  const [horizontalDataBad, setHorizontalDataBad] = useState(
    {
      labels: [],
      datasets: [
        {
          label: "Nº de Páginas",
          type: 'bar',
          data: [],
          backgroundColor: "red",
          borderWidth: 0,
        }
      ]
    }
  );

  const [topGoodPracticesA, setTopGoodPracticesA] = useState([]);
  const [topGoodPracticesAA, setTopGoodPracticesAA] = useState([]);
  const [topGoodPracticesAAA, setTopGoodPracticesAAA] = useState([]);
  const [topBadPracticesA, setTopBadPracticesA] = useState([]);
  const [topBadPracticesAA, setTopBadPracticesAA] = useState([]);
  const [topBadPracticesAAA, setTopBadPracticesAAA] = useState([]);
  const [dataGood, setDataGood] = useState([]);
  const [feedbackMessage, setFeedbackMessage] = useState("")
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [language] = useState(localStorage.getItem('i18nextLng').split("-")[0]);
  // Memoize initial empty states
  const initialSuccessCriteria = useMemo(() => ({}), []);
  const [successCriteriaSuccess, setSuccessCriteriaSuccess] = useState(initialSuccessCriteria);
  const [successCriteriaErrors, setSuccessCriteriaErrors] = useState(initialSuccessCriteria);
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
    
    // Save website context for navigation to pages/reports
    if (id && websiteName) {
      setWebsiteNavigationContext({
        websiteId: id,
        websiteSlug: encodeURIComponent(websiteName),
        websiteName: websiteName
      });
    }
  }, [location.pathname, id, websiteName]);

  const stateOrigin = getWebsiteOriginFromState(location.state);
  const stateOriginKey = stateOrigin ? `${stateOrigin.type}:${stateOrigin.name || ""}` : "";

  useEffect(() => {
    // Origem explícita na navegação (ex.: link do breadcrumb da edição) tem prioridade
    // sobre a heurística do localStorage (issue #131).
    if (stateOrigin) {
      setBreadcrumbs([
        ...getWebsiteOriginTrail(stateOrigin, t).map(({ to, label }) => ({
          children: <Link to={to}>{label}</Link>,
        })),
        { title: websiteName },
      ]);
      return;
    }

    const previousPath = localStorage.getItem('previousPath') || '';
    const navContext = getEffectiveNavigationContext(previousPath);

    if (navContext) {
      if (navContext.type === 'directory') {
        const { directoryName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/directories">Diretórios</Link> },
          { children: <Link to={`/dashboard/directories/view/${encodeURIComponent(directoryName)}`}>{directoryName}</Link> },
          { title: websiteName }
        ]);
      } else if (navContext.type === 'entity') {
        const { entityName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/entities">Entidades</Link> },
          { children: <Link to={`/dashboard/entities/view/${encodeURIComponent(entityName)}`}>{entityName}</Link> },
          { title: websiteName }
        ]);
      } else if (navContext.type === 'category') {
        const { categoryName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/categories">Categorias</Link> },
          { children: <Link to={`/dashboard/categories/view/${encodeURIComponent(categoryName)}`}>{categoryName}</Link> },
          { title: websiteName }
        ]);
      } else {
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/websites">Sítios Web</Link> },
          { title: websiteName }
        ]);
      }
    } else {
      setBreadcrumbs([
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/websites">Sítios Web</Link> },
        { title: websiteName }
      ]);
    }
    // stateOrigin é derivado de stateOriginKey; t muda só com o idioma.
  },[websiteName, stateOriginKey, t]);
  /*const fetchWebsitesPages = async () => {
    const responsePages = await api.get(`/website/${websiteName}/user/admin/pages`);
    const pagesData = responsePages.data.result
    setData(pagesData.map(page => ({
      id: page.PageId,
      Uri: page.Uri,
      Score: page.Score,
      Evaluation_Date: moment(page.Evaluation_Date).format('DD/MM/YYYY'),
      Element_Count: calculateTotalElements(page.Element_Count),
      A: page.A,
      AA: page.AA,
      AAA: page.AAA,
      e: "?",
      OPAW: page.Show_In.split("")[2] === "1" ? "Sim" : "Não"
    })));
  
  }*/
  
  useEffect(() => {
    if (!id) return;
    const fetchData = async () => {
      let ams;
      try {
        const response = await api.get(`/analytics/website/${id}`);
        ams = response.data.data.ams;
      } catch (error) {
        console.error("Error fetching website analytics:", error);
        setFeedbackMessage("Erro ao carregar os indicadores do sítio web.");
        setShowFeedbackModal(true);
        return;
      }

      const totalPages = Number(ams.total_pages_evaluated) || 0;
      // The API returns 1970-01-01 when the website has no evaluated pages.
      const formatDate = (date) =>
        date && !String(date).startsWith("1970") ? moment(date).format("DD/MM/YYYY") : "N/A";
      const percentOf = (value) => (totalPages ? ((value / totalPages) * 100).toFixed(1) : "0.0");
      const pagesWithoutErrors = ams.pagesWithoutErrorsA + ams.pagesWithoutErrorsAA + ams.pagesWithoutErrorsAAA;

      setListItems([
        { title: 'Pontuação média', value: ams.score != null ? Number(ams.score).toFixed(1) : 'N/A' },
        { title: 'Avaliação mais antiga de uma página', value: formatDate(ams.oldestPageDate) },
        { title: 'Avaliação mais recente de uma página', value: formatDate(ams.recentPageDate) },
        { title: 'Nº de páginas recolhidas(avaliadas)', value: `${ams.pagesCount}(${totalPages})` },
      ]);
      setListItemsGlobal([
        { title: 'Páginas Avaliadas', value: totalPages },
        { title: 'Páginas Não Conformes', value: totalPages - pagesWithoutErrors },
        {
          title: 'Páginas Conformes', value: pagesWithoutErrors,
          itemsList: [
            { title: 'Conformidade A', value: `${ams.pagesWithoutErrorsA} (${percentOf(ams.pagesWithoutErrorsA)}%)` },
            { title: 'Conformidade AA', value: `${ams.pagesWithoutErrorsAA} (${percentOf(ams.pagesWithoutErrorsAA)}%)` },
            { title: 'Conformidade AAA', value: `${ams.pagesWithoutErrorsAAA} (${percentOf(ams.pagesWithoutErrorsAAA)}%)` },
          ]
        },
      ]);

      // Bar chart: frequency by page score (not website average since it's a single website)
      const barDataDynamicArr = ams.scoreDistributionFrequency ?? [];
      const distributionTotal = barDataDynamicArr.reduce((acc, curr) => acc + curr, 0);
      const percentOfDistribution = (value) =>
        `${(distributionTotal ? (value / distributionTotal) * 100 : 0).toFixed(2)}%`;

      setDataListBar(
        barDataDynamicArr.map((item, index) => {
          const cumulative = barDataDynamicArr.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0);
          return {
            range: scoreRangeLabel(index),
            frequency: item,
            frequency_percent: percentOfDistribution(item),
            cumulative,
            cumulative_percent: percentOfDistribution(cumulative),
          };
        })
      );

      setBarDataDynamic({
        ...barData,
        datasets: [
          {
            type: 'bar',
            label: "Frequência (nº de páginas)",
            data: barDataDynamicArr,
            backgroundColor: '#339',
            categoryPercentage: 1,
            barPercentage: 1,
            grouped: true,
          }
        ]
      });

      const getLangTrans = (key, n) => {
        const plural = n > 1 ? "p" : "s";
        return translations?.[language]?.translation?.["TESTS_RESULTS"]?.[key]?.[plural]?.replace("{{value}}", n) ?? "";
      };

      // Counts come as strings in successDetailsTable / errorsDetailsTable.
      const normalizePractices = (table) => (table?.data ?? []).map(practice => ({
        key: practice.key,
        nOccurrences: Number(practice.occurrenceCount) || 0,
        nPages: Number(practice.pageCount) || 0,
        lvl: (practice.level || ruleset[practice.key]?.level || "").toUpperCase(),
      }));
      const successPractices = normalizePractices(ams.successDetailsTable);
      const errorPractices = normalizePractices(ams.errorsDetailsTable);

      setHorizontalDataGood({
        labels: successPractices.map(practice => getLangTrans(practice.key, practice.nOccurrences)),
        datasets: [
          {
            label: "Nº de Páginas",
            type: 'bar',
            data: successPractices.map(practice => practice.nOccurrences),
            backgroundColor: "green",
            borderWidth: 0,
          }
        ]
      });
      setHorizontalDataBad({
        labels: errorPractices.map(practice => getLangTrans(practice.key, practice.nOccurrences)),
        datasets: [
          {
            label: "Nº de Páginas",
            type: 'bar',
            data: errorPractices.map(practice => practice.nOccurrences),
            backgroundColor: "red",
            borderWidth: 0,
          }
        ]
      });

      const toTableRow = (practice) => ({
        name: getLangTrans(practice.key, practice.nOccurrences),
        praticesPerPage: 1,
        pages: practice.nPages,
        occurences: practice.nOccurrences,
        level: practice.lvl,
      });
      setDataBad(errorPractices.map(toTableRow));
      setDataGood(successPractices.map(toTableRow));

      const mapTop = (list) => [...list].sort((a, b) => b.nOccurrences - a.nOccurrences).slice(0, 5).map(practice => ({
        level: practice.lvl,
        practice: getLangTrans(practice.key, practice.nOccurrences),
      }));

      setTopGoodPracticesA(mapTop(successPractices.filter(p => p.lvl === "A")));
      setTopGoodPracticesAA(mapTop(successPractices.filter(p => p.lvl === "AA")));
      setTopGoodPracticesAAA(mapTop(successPractices.filter(p => p.lvl === "AAA")));
      setTopBadPracticesA(mapTop(errorPractices.filter(p => p.lvl === "A")));
      setTopBadPracticesAA(mapTop(errorPractices.filter(p => p.lvl === "AA")));
      setTopBadPracticesAAA(mapTop(errorPractices.filter(p => p.lvl === "AAA")));

      // Group practices by WCAG Success Criteria, resolving each key's criteria from the ruleset
      const toCriteriaList = (scs) => {
        if (!scs) return [];
        const list = Array.isArray(scs)
          ? scs
          : (typeof scs === 'string' ? scs.split(',') : []);
        return list.map(c => String(c).trim()).filter(Boolean);
      };

      const groupBySuccessCriteria = (practices) => {
        const grouped = {};
        practices.forEach(practice => {
          const test = ruleset[practice.key]?.test;
          toCriteriaList(ruleset[practice.key]?.scs).forEach(criteria => {
            if (!grouped[criteria]) grouped[criteria] = [];
            grouped[criteria].push({
              practice: test ? t(`ELEMS.${test}`) : practice.key,
              pages: practice.nPages,
              occurrences: practice.nOccurrences,
              level: practice.lvl,
              websiteCount: 1 // For single website view
            });
          });
        });
        const formatted = {};
        Object.keys(grouped).sort().forEach(criteria => {
          formatted[criteria] = {
            criteriaCode: criteria,
            practiceCount: grouped[criteria].length,
            practices: grouped[criteria]
          };
        });
        return formatted;
      };

      setSuccessCriteriaSuccess(groupBySuccessCriteria(successPractices));
      setSuccessCriteriaErrors(groupBySuccessCriteria(errorPractices));

    };
    fetchData();
  }, [id, language, t]);

  const fetchWebsitesPages = useCallback(async (page, limit, searchTerm) => {
    const queryObj = {
      filters: { websiteId: Number(id) },
      pagination: { limit, page },
    };
    if (searchTerm) queryObj.filters.searchTerm = searchTerm;
    if (sorts) queryObj.sorts = sorts;
    const query = qs.stringify(queryObj);
    const response = await api.get(`/pages?${query}`);
    const { data, pagination } = response.data;
    setAllPagesData(
      data.map((item) => {
        const evaluation = item.evaluation;
        const elementCount = typeof evaluation?.tagCount === "object"
          ? calculateEvaluationElementCount(evaluation.tagCount)
          : Number(evaluation?.tagCount) || 0;

        return {
          id: item.id,
          Uri: item.url,
          Score: evaluation?.score != null ? Number(evaluation.score) : 0,
          LastEvaluation: evaluation?.createdAt
            ? moment(evaluation.createdAt).format("DD/MM/YYYY")
            : "Pendente",
          ElementCount: elementCount,
          A: evaluation?.A ?? 0,
          AA: evaluation?.AA ?? 0,
          AAA: evaluation?.AAA ?? 0,
          Evaluated: Boolean(evaluation),
          EvaluationStatus: "",
          OPAW: isPageInObservatory(item) ? "Sim" : "Não",
        };
      })
    );
    setTotalItems(pagination.totalItems);
  }, [id, sorts]);

  useEffect(() => {
    if (!id) return;
    const timeout = setTimeout(() => {
      fetchWebsitesPages(currentPage, itemsPerPage, search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, itemsPerPage, search, id, fetchWebsitesPages]);

  useEffect(() => {
    if (!completedTick || !id) return undefined;
    const timeout = setTimeout(() => fetchWebsitesPages(currentPage, itemsPerPage, search), 1500);
    return () => clearTimeout(timeout);
  }, [completedTick]);

  const handleSearchChange = (e) => {
    const value = typeof e === "string" ? e : (e?.target?.value ?? "");
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleDeletePages = async () => {
    if (!canDelete) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage(t("PAGES_PAGE.DELETE.none_selected"));
      setShowFeedbackModal(true);
      return;
    }

    const pagesId = checkboxesSelected.map(item => item.id);
    
    try {
      await deletePages(pagesId);
      setFeedbackMessage(t("PAGES_PAGE.DELETE.success", { count: pagesId.length }));
      setCheckboxesSelected([]);
      await fetchWebsitesPages(currentPage, itemsPerPage, search);
    } catch (error) {
      setFeedbackMessage(t(getDeletePagesErrorKey(error)));
    }
    
    setShowFeedbackModal(true);
  };

  const handleExportCSV = async () => {
    try {
      await downloadAnalyticsExport({ resource: "website", format: "csv", context: "ams", entityId: id });
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  }
  const handleReevaluatePages = async () => {
    if (!canEdit) return;
    const pagesId = checkboxesSelected.map(item => item.id);
    const response = await api.post("/evaluations", {
      triggerType: "PAGE",
      targetIds: pagesId,
    });
    if (response.status === 201) {
      setFeedbackMessage("A reavaliação foi iniciada com sucesso!");
      setShowFeedbackModal(true);
    } else {
      setFeedbackMessage("Erro ao iniciar a reavaliação!");
      setShowFeedbackModal(true);
    }
  }
  const handleShowHideObservatory = async () => {
    if (!canEdit) return;
    const summary = await togglePagesObservatory(checkboxesSelected.map(item => ({
      id: item.id,
      websiteId: id,
      inObservatory: item.OPAW === "Sim",
    })));

    setFeedbackMessage(getObservatoryFeedback(summary));
    setCheckboxesSelected([]);
    await fetchWebsitesPages(currentPage, itemsPerPage, search);
    setShowFeedbackModal(true);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1 id="lista-paginas" tabIndex={-1}>{t('WEBSITES_PAGE.LIST.title', { websiteName })}</h1>
      <div className="content bg-white">
        <h2>{t('WEBSITES_PAGE.LIST.subtitle', { websiteName })}</h2>
        <ContentListPages
        onSortChange={onSortChange}
          checkboxesSelected={checkboxesSelected}
          setCheckboxesSelected={setCheckboxesSelected}
          data={pageRows}
          setData={setAllPagesData}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          search={search}
          handleSearchChange={handleSearchChange}
          handleDeletePages={handleDeletePages}
          handleReevaluatePages={handleReevaluatePages}
          handleShowHideObservatory={handleShowHideObservatory}
        />
      </div>

      <div className="mt-5 bg-white">
        <h2>{t('WEBSITES_PAGE.LIST.export_data')}</h2>
        <p>{t('WEBSITES_PAGE.LIST.export_data_description', { websiteName })}</p>
        <div className="d-flex justify-content-start align-items-end">
          <Button
            darkTheme={theme}
            text={t('WEBSITES_PAGE.LIST.export_csv')}
            className="btn-primary"
            onClick={handleExportCSV}
          />
        </div>
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Indicadores globais do sítio web</h2>
        <Indicators listItems={listItems} />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Conformidade do sítio web</h2>
        <Indicators listItems={listItemsGlobal} />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo das páginas analisadas no sítio web</h2>
        <Tabs
          defaultActiveKey="chart"
          darkTheme={theme}
          tabs={[
            {
              eventKey: "chart",
              title: "Gráfico",
              component: (
                <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <AccessibleBarChart
                    ariaLabel="Histograma das pontuações do AccessMonitor"
                    data={barDataDynamic}
                    options={theme === "light" ? barOptions : barOptionsDark}
                  />
                </div>
              ),
            },
            {
              eventKey: "table",
              title: "Tabela",
              component: (
                <SortingTable
                  darkTheme={theme}
                  hasSort={false}
                  pagination={false}
                  caption="Distribuição das pontuações AccessMonitor no universo das páginas analisadas no sítio web"
                  headers={[[
                    { type: "Text", nRow: 1, name: "Intervalo de pontuação", property: "range" },
                    { type: "Text", nRow: 1, name: "Nº de páginas", property: "frequency", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "% Frequência", property: "frequency_percent", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Acumulado", property: "cumulative", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "% Acumulado", property: "cumulative_percent", justifyCenter: true },
                  ]]}
                  dataList={dataListBar}
                  columnsOptions={{
                    range: { type: "Text", center: false, bold: true },
                    frequency: { type: "Text", center: true, bold: false },
                    frequency_percent: { type: "Text", center: true, bold: false },
                    cumulative: { type: "Text", center: true, bold: false },
                    cumulative_percent: { type: "Text", center: true, bold: false },
                  }}
                />
              ),
            },
          ]}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Boas Práticas de acessibilidade encontradas no sítio web</h2>
        <Tabs
          defaultActiveKey="chart"
          darkTheme={theme}
          tabs={[
            {
              eventKey: "chart",
              title: "Gráfico",
              component: <HtmlLabelBarChart data={horizontalDataGood} />,
            },
            {
              eventKey: "table",
              title: "Tabela",
              component: (
                <SortingTable
                  darkTheme={theme}
                  hasSort={false}
                  pagination={false}
                  caption="Boas práticas de acessibilidade encontradas no sítio web"
                  headers={[[
                    { type: "Text", nRow: 1, name: "Nível", bigWidth: "50%", property: "level", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Prática", property: "name", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Nº páginas", property: "pages", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Nº ocorrências", property: "occurences", justifyCenter: true },
                  ]]}
                  dataList={dataGood}
                  columnsOptions={{
                    level: { type: "Text", center: true, bold: true },
                    name: { type: "DangerousHTML", center: false, bold: false },
                    pages: { type: "Text", center: true, bold: false },
                    occurences: { type: "Text", center: true, bold: false },
                  }}
                />
              ),
            },
          ]}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Más Práticas de acessibilidade encontradas no sítio web</h2>
        <Tabs
          defaultActiveKey="chart"
          darkTheme={theme}
          tabs={[
            {
              eventKey: "chart",
              title: "Gráfico",
              component: <HtmlLabelBarChart data={horizontalDataBad} />,
            },
            {
              eventKey: "table",
              title: "Tabela",
              component: (
                <SortingTable
                  darkTheme={theme}
                  hasSort={false}
                  pagination={false}
                  caption="Más práticas de acessibilidade encontradas no sítio web"
                  headers={[[
                    { type: "Text", nRow: 1, name: "Nível", bigWidth: "50%", property: "level", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Prática", property: "name", bigWidth: "50%", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Nº páginas", property: "pages", justifyCenter: true },
                    { type: "Text", nRow: 1, name: "Nº ocorrências", property: "occurences", justifyCenter: true },
                  ]]}
                  dataList={dataBad}
                  columnsOptions={{
                    level: { type: "Text", center: true, bold: true },
                    name: { type: "DangerousHTML", center: false, bold: false },
                    pages: { type: "Text", center: true, bold: false },
                    occurences: { type: "Text", center: true, bold: false },
                  }}
                />
              ),
            },
          ]}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
        <Button
          darkTheme={theme}
          text="Ir para a lista de páginas do sítio web"
          className="btn-primary mb-4"
          onClick={() => {
            const el = document.getElementById("lista-paginas");
            el?.scrollIntoView({ behavior: "smooth", block: "start" });
            el?.focus({ preventScroll: true });
          }}
        />
        <ScoreDistributionRadar dataListBar={dataListBar} theme={theme} caption="Mancha gráfica da acessibilidade — número de páginas por nota das páginas do sítio web" />
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
            ]
          ]}
          dataList={topBadPracticesA}
          columnsOptions={{
            level: { type: "Text", center: false, bold: true },
            practice: { type: "DangerousHTML", center: false, bold: false },
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
            ]
          ]}
          dataList={topBadPracticesAA}
          columnsOptions={{
            level: { type: "Text", center: false, bold: true },
            practice: { type: "DangerousHTML", center: false, bold: false },
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
            ]
          ]}
          dataList={topBadPracticesAAA}
          columnsOptions={{
            level: { type: "Text", center: false, bold: true },
            practice: { type: "DangerousHTML", center: false, bold: false },
          }}
          pagination={false}
          caption="Top 5 dos erros de Nível AAA"
        />
      </div>
      <div className="mt-5 bg-white p-4 d-flex flex-column gap-4">
        <h2 className="mb-4">Top 5 das boas práticas mais frequentes por nível de conformidade</h2>
        <SortingTable
          darkTheme={theme}
          headers={[
            [
              { type: "Text", name: "Nível", property: "level" },
              { type: "Text", name: "Prática", property: "practice" },
            ]
          ]}
          dataList={topGoodPracticesA}
          columnsOptions={{
            level: { type: "Text", center: false, bold: true },
            practice: { type: "DangerousHTML", center: false, bold: false },
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
            ]
          ]}
          dataList={topGoodPracticesAA}
          columnsOptions={{
            level: { type: "Text", center: false, bold: true },
            practice: { type: "DangerousHTML", center: false, bold: false },
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
            ]
          ]}
          dataList={topGoodPracticesAAA}
          columnsOptions={{
            level: { type: "Text", center: false, bold: true },
            practice: { type: "DangerousHTML", center: false, bold: false },
          }}
          pagination={false}
          caption="Top 5 das boas práticas de Nível AAA"
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
                        {practice.practice}: <b>{practice.pages} página/s</b>
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
                        {practice.practice}: <b>{practice.pages} página/s</b>
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
      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title="Sítios Web"
      >
        <p role="alert">{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text="OK"
          className="btn-primary"
          onClick={() => setShowFeedbackModal(false)}
        />
      </Modal>
    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders
const ViewWebSites = memo(ViewWebSitesComponent);

export default ViewWebSites;