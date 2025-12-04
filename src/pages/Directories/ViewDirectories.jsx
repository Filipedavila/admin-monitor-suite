import React, { useState, useEffect, useMemo, memo, useTransition, useRef } from "react";
import { Button, StatisticsHeader, Breadcrumb, SortingTable, RadioGroup } from "ama-design-system";
import "./style.users.css";
import { RadarGraph } from "../../components/RadarGraph/index.jsx";
import { Link, useParams, useLocation } from "react-router-dom";
import { BarLineGraphTabs } from "../../components/BarLineGraph/index.jsx";
import {
  barData,
  barOptions,
  dataHeaders as dataHeadersBar,
  columnsOptions as columnsOptionsBar,
} from "../../components/BarLineGraph/table.config.jsx";
import { downloadCSV, getSimplifiedPracticesData } from "../../utils/utils.js";
import {
  columnsOptionsDetails,
  detailsTableHeaders,
  ariaLabels
} from "./table.config.jsx";
import { useTheme } from "../../context/ThemeContext";
import ContentListWebSites from "../Websites/components/ContentListWebSites.jsx";
import { barOptionsDark, dataRows as dataRowsWebSites } from "../Websites/table.config.jsx";
import { useTranslation } from "react-i18next";
import Indicators from "../../components/Indicators/index.jsx";
import { api } from "../../config/api";
import moment from "moment";
import { Modal } from "../../components/Modal";
import CrawlingModal from "../../components/CrawlingModal";
import { setRootNavigationContext } from "../../utils/navigation";
import { set } from "lodash";

const buildPracticesData = (simplifiedPracticesData, t) => {
  const practicesBySuccessCriteria = {
    success: {},
    errors: {}
  };

  const mapPractice = (target, item) => {
    const scs = item.scs;
    if (!scs || scs === '') return;
    scs.split(',').forEach(criteria => {
      const trimmed = criteria.trim();
      if (!target[trimmed]) target[trimmed] = [];
      target[trimmed].push({
        practice: t(`ELEMS.${item.practice}`),
        pages: item.pages,
        occurrences: item.occurrences,
        level: item.level.toUpperCase(),
        websiteCount: item.pages
      });
    });
  };

  (simplifiedPracticesData.success || []).forEach(item => mapPractice(practicesBySuccessCriteria.success, item));
  (simplifiedPracticesData.errors || []).forEach(item => mapPractice(practicesBySuccessCriteria.errors, item));

  const formatSuccessCriteriaData = (practicesData) => {
    const formatted = {};
    Object.keys(practicesData).sort().forEach(criteria => {
      const practices = practicesData[criteria];
      formatted[criteria] = {
        criteriaCode: criteria,
        practiceCount: practices.length,
        practices: practices
      };
    });
    return formatted;
  };

  return {
    details: (simplifiedPracticesData.success || []).map(item => ({
      practice: t(`ELEMS.${item.practice}`),
      pages: item.pages,
      occurrences: item.occurrences,
      level: item.level.toUpperCase()
    })),
    detailsBad: (simplifiedPracticesData.errors || []).map(item => ({
      practice: t(`ELEMS.${item.practice}`),
      pages: item.pages,
      occurrences: item.occurrences,
      level: item.level.toUpperCase()
    })),
    successCriteriaSuccess: formatSuccessCriteriaData(practicesBySuccessCriteria.success),
    successCriteriaErrors: formatSuccessCriteriaData(practicesBySuccessCriteria.errors)
  };
};

const buildDirectoryMetrics = (pages = [], websites = [], barDataTemplate = barData) => {
  const scoreBuckets = Array(9).fill(0);
  const websiteStats = {};
  let evaluatedCount = 0;
  let scoreSum = 0;
  let oldestDate = null;
  let newestDate = null;

  pages.forEach(page => {
    const score = Number(page.Score || 0);
    const hasEvaluation = page.Evaluation_Date !== null && page.Evaluation_Date !== undefined;
    const hasScore = !Number.isNaN(score) && hasEvaluation;
    const websiteId = page.WebsiteId;

    if (!websiteStats[websiteId]) {
      websiteStats[websiteId] = {
        hasA: false,
        hasAA: false,
        hasAAA: false,
        evaluatedCount: 0,
        scoreSum: 0
      };
    }

    const stats = websiteStats[websiteId];
    stats.hasA = stats.hasA || (page.A || 0) > 0;
    stats.hasAA = stats.hasAA || (page.AA || 0) > 0;
    stats.hasAAA = stats.hasAAA || (page.AAA || 0) > 0;

    if (hasScore) {
      evaluatedCount += 1;
      scoreSum += score;
      stats.evaluatedCount += 1;
      stats.scoreSum += score;

      const evalDate = new Date(page.Evaluation_Date);
      if (!oldestDate || evalDate < oldestDate) oldestDate = evalDate;
      if (!newestDate || evalDate > newestDate) newestDate = evalDate;

      const bucketIndex = Math.min(Math.max(Math.floor(score) - 1, 0), 8);
      scoreBuckets[bucketIndex] += 1;
    }
  });

  const totalPages = pages.length;
  const totalWebsites = Object.keys(websiteStats).length;
  const totalEvaluatedPages = evaluatedCount;
  const averageScore = evaluatedCount ? scoreSum / evaluatedCount : 0;

  let conformantWebsites = 0;
  let nonConformantWebsites = 0;
  let conformCounts = { A: 0, AA: 0, AAA: 0 };

  Object.values(websiteStats).forEach(stat => {
    const hasErrors = stat.hasA || stat.hasAA || stat.hasAAA;
    if (hasErrors) {
      nonConformantWebsites += 1;
    } else {
      conformantWebsites += 1;
      conformCounts.A += 1;
      conformCounts.AA += 1;
      conformCounts.AAA += 1;
    }
  });

  const safeTotalPages = totalPages || 1;
  const dataListBar = scoreBuckets.map((count, index) => {
    const cumulative = scoreBuckets.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0);
    return {
      range: `[${index + 1} - ${index + 2}[`,
      frequency: count,
      frequency_percent: `${((count / safeTotalPages) * 100).toFixed(2)}%`,
      cumulative: cumulative,
      cumulative_percent: `${((cumulative / safeTotalPages) * 100).toFixed(2)}%`
    };
  });

  const radarWebsites = Object.entries(websiteStats).map(([websiteId, stat]) => {
    const website = websites.find(w => w.WebsiteId?.toString() === websiteId.toString());
    if (!website) return null;
    const average = stat.evaluatedCount ? stat.scoreSum / stat.evaluatedCount : 0;
    return {
      url: website.StartingUrl,
      averageScore: average.toFixed(2)
    };
  }).filter(Boolean);

  return {
    scoreBuckets,
    radarWebsites,
    dataListBar,
    listItems: [
      { title: 'Pontuação média', value: Math.round(averageScore) },
      { title: 'Avaliação mais antiga de uma página', value: oldestDate ? moment(oldestDate).format('DD/MM/YY') : '-' },
      { title: 'Avaliação mais recente de uma página', value: newestDate ? moment(newestDate).format('DD/MM/YY') : '-' },
      { title: 'Nº de Sítios Web', value: totalWebsites },
      { title: 'Nº de páginas(Avaliadas)', value: `${totalPages} (${totalEvaluatedPages})` },
      { title: 'Nº médio de páginas por Sítios', value: totalWebsites ? Math.round(totalPages / totalWebsites) : 0 },
    ],
    listItemsGlobal: [
      { title: 'Sítios Web', value: totalWebsites },
      { title: 'Sítios Web não conformes', value: nonConformantWebsites },
      {
        title: 'Sítios Web conformes', value: conformantWebsites,
        itemsList: [
          { title: 'A', value: `${conformCounts.A} (${totalWebsites ? ((conformCounts.A / totalWebsites) * 100).toFixed(2) : '0.00'}%)` },
          { title: 'AA', value: `${conformCounts.AA} (${totalWebsites ? ((conformCounts.AA / totalWebsites) * 100).toFixed(2) : '0.00'}%)` },
          { title: 'AAA', value: `${conformCounts.AAA} (${totalWebsites ? ((conformCounts.AAA / totalWebsites) * 100).toFixed(2) : '0.00'}%)` },
        ]
      },
    ],
    barDataTemplate
  };
};

const ViewDirectoriesComponent = () => {
  const location = useLocation();
  const { directoryName } = useParams();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [radioValue, setRadioValue] = useState(1);

  const [listItems, setListItems] = useState([]);
  const [listItemsGlobal, setListItemsGlobal] = useState([]);
  const [data, setData] = useState(dataRowsWebSites || []);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  // Memoize initial empty states
  const initialSuccessCriteria = useMemo(() => ({}), []);

 
  const [dataListDetails, setDataListDetails] = useState([]);
  const [dataListDetailsBad, setDataListDetailsBad] = useState([]);
  const [successCriteriaSuccess, setSuccessCriteriaSuccess] = useState(initialSuccessCriteria);
  const [successCriteriaErrors, setSuccessCriteriaErrors] = useState(initialSuccessCriteria);
  const [originalData, setOriginalData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCrawlingModal, setShowCrawlingModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [radarWebsites, setRadarWebsites] = useState([]);
  const [counter, setCounter] = useState(0);
  const [dataListBar, setDataListBar] = useState([{
    range: '[1 - 2[',
    frequency: 2,
    frequency_percent: '5%',
    cumulative: 2,
    cumulative_percent: '5%'
  }]);
  const [isPending, startTransition] = useTransition();
  const pagesCacheRef = useRef({});
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);
  const [isProcessingStats, setIsProcessingStats] = useState(true);
  const [websitesError, setWebsitesError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

  const clearDirectoryPagesCache = () => {
    delete pagesCacheRef.current[directoryName];
  };

  const loadDirectoryPages = async () => {
    // Use only in-memory cache to avoid sessionStorage quota issues
    if (pagesCacheRef.current[directoryName]) {
      return pagesCacheRef.current[directoryName];
    }

    const responsePages = await api.get(`/directory/${encodeURIComponent(directoryName)}/websites/pages`);
    const pages = responsePages.data.result || [];
    pagesCacheRef.current[directoryName] = pages;
    return pages;
  };

  const fetchDataWebsite = async (shouldUpdateState = true) => {
    const response = await api.get(`/directory/${directoryName}/websites`);
    const websites = response.data.result || [];
    const mappedWebsites = websites.map(item => ({
      id: item.WebsiteId,
      Name: item.Name,
      StartingUrl: item.StartingUrl,
      Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
      Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
      Declaration: item.Declaration === null ? "Nao avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaracao nao conforme",
      edit: "Editar",
    }));

    if (shouldUpdateState) {
      setData(mappedWebsites);
      setOriginalData(mappedWebsites);
    }

    return { response, websites, mappedWebsites };
  }
  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        // Reset flags for new directory
        setHasInitialLoad(false);
        
        // Phase 1: Load websites first (fast)
        setIsLoadingWebsites(true);
        setWebsitesError(null);
        const { websites, mappedWebsites } = await fetchDataWebsite(false);
        
        if (isCancelled) return;
        
        // Show websites immediately
        setData(mappedWebsites);
        setOriginalData(mappedWebsites);
        setIsLoadingWebsites(false);
        setHasInitialLoad(true); // Mark initial load complete

        // Phase 2: Load pages and compute metrics (slow)
        setIsProcessingStats(true);
        const pages = await loadDirectoryPages();
        
        if (isCancelled) return;

        const simplifiedPracticesData = getSimplifiedPracticesData(pages);
        const practicesData = buildPracticesData(simplifiedPracticesData, t);
        const metrics = buildDirectoryMetrics(pages, websites, barData);

        // Defer heavy state updates to keep UI responsive
        startTransition(() => {
          setDataListDetails(practicesData.details);
          setDataListDetailsBad(practicesData.detailsBad);
          setSuccessCriteriaSuccess(practicesData.successCriteriaSuccess);
          setSuccessCriteriaErrors(practicesData.successCriteriaErrors);
          setRadarWebsites(metrics.radarWebsites);
          setDataListBar(metrics.dataListBar);
          setListItems(metrics.listItems);
          setListItemsGlobal(metrics.listItemsGlobal);
          setBarDataDynamic({
            ...barData,
            datasets: [
              {
                type: 'bar',
                label: "Frequência (nº de páginas)",
                data: metrics.scoreBuckets,
                backgroundColor: '#339',
                categoryPercentage: 1,
                barPercentage: 1,
                grouped: true,
              }
            ]
          });
          setIsProcessingStats(false);
        });
      } catch (error) {
        console.error("Error fetching directory data:", error);
        setWebsitesError('Erro ao carregar dados do diretório');
        setIsLoadingWebsites(false);
        setIsProcessingStats(false);
        setHasInitialLoad(true); // Mark as complete even on error
      }
    };

    fetchData();
    
    // Set root context when viewing a directory
    if (directoryName) {
      setRootNavigationContext({
        type: 'directory',
        data: { directoryName }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [directoryName, t]);

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/directories">Diretórios</Link> },
    { title: directoryName }
  ];

  const [barDataDynamic, setBarDataDynamic] = useState(barData);
  const barOptionsCopy = JSON.parse(JSON.stringify(barOptions || {}));
  // Server-side pagination & search for directory websites
  useEffect(() => {
    // Only run after initial load is complete
    if (!hasInitialLoad) return;
    
    const fetchPaginated = async () => {
      try {
        const countRes = await api.get(`/directory/${encodeURIComponent(directoryName)}/websites/count/search=${encodeURIComponent(search || '')}`);
        setTotalItems(Number(countRes.data.result || 0));
        const offset = currentPage - 1;
        const listRes = await api.get(`/directory/${encodeURIComponent(directoryName)}/websites/all/${itemsPerPage}/${offset}/sort=/direction=/search=${encodeURIComponent(search || '')}`);
        const rows = (listRes.data.result || []).map(item => ({
          id: item.WebsiteId,
          Name: item.Name,
          StartingUrl: item.StartingUrl,
          Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
          Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
          Declaration: item.Declaration === null ? "Nao avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaracao nao conforme",
          edit: "Editar",
        }));
        setData(rows);
        setOriginalData(rows);
      } catch (e) {}
    };
    fetchPaginated();
  }, [directoryName, currentPage, itemsPerPage, search]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => { setItemsPerPage(n); setCurrentPage(1); };

  const handleCrawlingWebsites = async ({ maxDepth, maxPages, waitJS, selectedItems }) => {
    if (selectedItems.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para fazer crawling.");
      setShowFeedbackModal(true);
      return;
    }

    const websites = selectedItems.map(item => ({
      url: data.find(d => d.id === item.id).StartingUrl,
      websiteId: item.id
    }));

    try {
      const response = await api.post('/crawler/crawl', {
        websites: websites,
        maxDepth: maxDepth,
        maxPages: maxPages,
        waitJS: waitJS ? 1 : 0
      });

      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("O crawling foi iniciado com sucesso! O processo será executado em segundo plano.");
        setCheckboxesSelected([]);
        setShowCrawlingModal(false);

      }
    } catch (error) {
      setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  // Handle delete websites
  const handleDeleteWebsites = async () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para eliminar.");
      setShowFeedbackModal(true);
      return;
    }
    const websiteIds = checkboxesSelected.map(item => item.id);
    try {
      const response = await api.post('/website/deleteBulk', {
        websitesId: websiteIds
      });

      if (response.status === 201 || response.status === 200) {
        setData(originalData?.filter(item => !websiteIds?.includes(item.id)));
        setOriginalData(originalData.filter(item => !websiteIds?.includes(item.id)));
        setFeedbackMessage("Sítios web eliminados com sucesso!");
        setCheckboxesSelected([]);
        setSearch("");
        clearDirectoryPagesCache();
      }
    } catch (error) {
      setFeedbackMessage("Erro ao eliminar sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  // Handle delete pages
  const handleDeletePagesWebsites = async () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para eliminar páginas.");
      setShowFeedbackModal(true);
      return;
    }
    const websiteIds = checkboxesSelected.map(item => item.id);
    try {
      const response = await api.post('/website/pages/deleteBulk', {
        websitesId: websiteIds
      });

      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("Páginas dos sítios web eliminadas com sucesso!");
        setCheckboxesSelected([]);
        setSearch("");
        clearDirectoryPagesCache();
        await fetchDataWebsite();
      }
    } catch (error) {
      setFeedbackMessage("Erro ao eliminar páginas dos sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  // Handle re-evaluate websites
  const handleReevaluateWebsites = async () => {
    const websiteIds = checkboxesSelected.map(item => item.id);
    const reEvaluate = radioValue === "1" ? "all" : "observatory";
    try {
      const response = await api.post('/website/reEvaluate', {
        websitesId: websiteIds,
        option: reEvaluate
      });
      console.log("RESPONSE STATUS:", response.status === 201);
      if (response.status === 201) {
        setFeedbackMessage("As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível.");
        setCheckboxesSelected([]);
        setShowModal(false);
        setSearch("");
        clearDirectoryPagesCache();
        await fetchDataWebsite();
      }
    } catch (error) {
      console.error("Error:", error);
      setFeedbackMessage("Erro ao iniciar reavaliação dos sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleOpenCrawlingModal = () => {
    setShowCrawlingModal(true);
  };

  const handleExportCSV = async () => {
    try {
   
      downloadCSV(
        data.map((item) => {
          return {
            WebsiteId: item.id,
          }
        }),
        "Diretório"
      );
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
    
  }
  return (
    <div>
      <Breadcrumb data={breadcrumbs || []} />
      <h1>{t('DIRECTORIES_PAGE.LIST.title', { directoryName })}</h1>

      <ContentListWebSites
        title={t('DIRECTORIES_PAGE.LIST.subtitle', { directoryName })}
        checkboxesSelected={checkboxesSelected}
        setCheckboxesSelected={setCheckboxesSelected}
        data={data}
        setData={setData}
        search={search}
        handleSearchChange={e => setSearch(e.target.value)}
        onDeleteWebsites={handleDeleteWebsites}
        onDeletePagesWebsites={handleDeletePagesWebsites}
        onReevaluateWebsites={handleReevaluateWebsites}
        onCrawlWebsites={handleOpenCrawlingModal}
      />

      <div className="bg-white mt-5">
        <h2>{t('DIRECTORIES_PAGE.LIST.export_data')}</h2>
        <p>{t('DIRECTORIES_PAGE.LIST.export_data_description', { directoryName })}</p>
        <div className="d-flex justify-content-start align-items-end">
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.export_csv')}
            className="btn-primary"
            disabled={data.length === 0}
            onClick={handleExportCSV}
          />
        </div>
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">{t('DIRECTORIES_PAGE.LIST.global_indicators')}</h2>
        {isProcessingStats ? (
          <p className="text-muted">A calcular indicadores...</p>
        ) : (
          <Indicators listItems={listItems} />
        )}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Conformidade global do Diretório</h2>
        {isProcessingStats ? (
          <p className="text-muted">A calcular conformidade...</p>
        ) : (
          <Indicators listItems={listItemsGlobal} />
        )}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo do Diretório</h2>
        {isProcessingStats ? (
          <p className="text-muted">A preparar distribuição...</p>
        ) : (
          <BarLineGraphTabs
            columnsOptions={columnsOptionsBar}
            barData={barDataDynamic}
            barOptions={theme === "light" ? barOptionsCopy : barOptionsDark}
            dataHeaders={dataHeadersBar}
            dataList={dataListBar}
            darkTheme={theme}
          />
        )}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
        {isProcessingStats ? (
          <p className="text-muted">A preparar gráfico radar...</p>
        ) : (
          <RadarGraph darkTheme={theme} labelDataSet="Pontuação por sítio Web" websites={radarWebsites}showTabs={true} />
        )}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
        {isProcessingStats ? (
          <p className="text-muted">A calcular práticas...</p>
        ) : (
          <SortingTable
            hasSort={false}
            headers={detailsTableHeaders}
            dataList={dataListDetails?.filter(e => !e.occurrences.toString()?.includes("lang"))}
            columnsOptions={columnsOptionsDetails}
            darkTheme={theme}
            pagination={false}
            links={false}
            ariaLabels={ariaLabels}
            caption="Distribuição detalhada das melhores práticas"
            setDataList={() => { }}
            nextPage={() => { }}
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[]}
            iconsAltTexts={[]}
            paginationButtonsTexts={[]}
            project=""
            setCheckboxesSelected={() => {}}
          />
        )}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das piores práticas</h2>
        {isProcessingStats ? (
          <p className="text-muted">A calcular más práticas...</p>
        ) : (
          <SortingTable
            hasSort={false}
            headers={detailsTableHeaders}
            dataList={dataListDetailsBad?.filter(e => !e.occurrences.toString()?.includes("lang"))}
            columnsOptions={columnsOptionsDetails}
            darkTheme={theme}
            pagination={false}
            links={false}
            ariaLabels={ariaLabels}
            caption="Distribuição detalhada das piores práticas"
            setDataList={() => { }}
            nextPage={() => { }}
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[]}
            iconsAltTexts={[]}
            paginationButtonsTexts={[]}
            project=""
            setCheckboxesSelected={() => {}}
          />
        )}
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Práticas por Critério de Sucesso WCAG 2.1</h2>
        <div>
          <h3 style={{ fontWeight: 700, marginTop: 32 }}>Boas práticas</h3>
          {Object.keys(successCriteriaSuccess).length > 0 ? (
            Object.entries(successCriteriaSuccess)
              .sort(([a], [b]) => a.localeCompare(b))
              ?.map(([criteriaCode, criteriaData]) => (
                <div key={criteriaCode} style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "1.1em" }}>
                    Critério de sucesso {criteriaCode} ({criteriaData.practiceCount})
                  </div>
                  <ul style={{ marginTop: 8 }}>
                    {criteriaData.practices?.map((practice, index) => (
                      <li key={index}>
                        {practice.practice}: <b>{practice.websiteCount} sítio/s web</b>
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
              ?.map(([criteriaCode, criteriaData]) => (
                <div key={criteriaCode} style={{ marginTop: 16 }}>
                  <div style={{ fontWeight: 600, fontSize: "1.1em" }}>
                    Critério de sucesso {criteriaCode} ({criteriaData.practiceCount})
                  </div>
                  <ul style={{ marginTop: 8 }}>
                    {criteriaData.practices.map((practice, index) => (
                      <li key={index}>
                        {practice.practice}: <b>{practice.websiteCount} sítio/s web</b>
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
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        title={t('WEBSITES_PAGE.LIST.re_evaluate_websites')}
      >
        <p>Escolha que páginas quer reavaliar</p>
        <RadioGroup
          darkTheme={theme}
          data={[
            {
              id: '1',
              name: "Todas as páginas"
            },
            {
              id: '2',
              name: "Apenas as páginas do observatório"
            }
          ]}
          inline
          onChange={(value) => setRadioValue(value)}
          value={radioValue}
          name="format"
        />
        <Button
          darkTheme={theme}
          text={t('WEBSITES_PAGE.LIST.re_evaluate_websites')}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={handleReevaluateWebsites}
        />
      </Modal>
      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title="Sítios Web"
      >
        <p>{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text="OK"
          className="btn-primary"
          onClick={() => setShowFeedbackModal(false)}
        />
      </Modal>
      <CrawlingModal
        isOpen={showCrawlingModal}
        onRequestClose={() => setShowCrawlingModal(false)}
        onSubmit={handleCrawlingWebsites}
        theme={theme}
        selectedItems={checkboxesSelected}
        itemType="websites"
      />
    </div>
  );
};

// Export memoized component to prevent unnecessary re-renders
const ViewDirectories = memo(ViewDirectoriesComponent);

export default ViewDirectories;
