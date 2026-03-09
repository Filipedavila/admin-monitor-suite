import { useState, useEffect, useMemo, memo } from "react";
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
import {
  columnsOptionsDetails,
  detailsTableHeaders,
  detailsTable,
  ariaLabels
} from "../Directories/table.config.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import ContentListWebSites from "../Websites/components/ContentListWebSites.jsx";
import { barOptionsDark, dataRows as dataRowsWebSites } from "../Websites/table.config.jsx";
import { useTranslation } from "react-i18next";
import Indicators from "../../components/Indicators";
import { api } from "../../config/api";
import moment from "moment";
import { downloadCSV, getSimplifiedPracticesData } from "../../utils/utils.js";
import CrawlingModal from "../../components/CrawlingModal";
import { Modal } from "../../components/Modal";
import { setRootNavigationContext } from "../../utils/navigation";

const ViewEntitiesComponent = () => {
  const location = useLocation();
  const { entityName } = useParams();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [radarWebsites, setRadarWebsites] = useState([]);
  const [barDataDynamic, setBarDataDynamic] = useState(barData);
  const [dataListBar, setDataListBar] = useState([]);
  // Memoize initial empty states
  const initialSuccessCriteria = useMemo(() => ({}), []);
  const [radioValue, setRadioValue] = useState(1)
  const [listItems, setListItems] = useState([]);
  const [listItemsGlobal, setListItemsGlobal] = useState([]);
  const [dataListDetails, setDataListDetails] = useState([]);
  const [dataListDetailsBad, setDataListDetailsBad] = useState([]);
  const [successCriteriaSuccess, setSuccessCriteriaSuccess] = useState(initialSuccessCriteria);
  const [successCriteriaErrors, setSuccessCriteriaErrors] = useState(initialSuccessCriteria);
  const barDataCopy = JSON.parse(JSON.stringify(barData || {}));
  const barOptionsCopy = JSON.parse(JSON.stringify(barOptions || {}));
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCrawlingModal, setShowCrawlingModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [search, setSearch] = useState("");
  const [originalData, setOriginalData] = useState([]); 
  const [dataForCSV, setDataForCSV] = useState([]);
  const [counter, setCounter] = useState(0);
  const [isLoadingWebsites, setIsLoadingWebsites] = useState(true);
  const [isProcessingStats, setIsProcessingStats] = useState(true);
  const [websitesError, setWebsitesError] = useState(null);
  const [hasInitialLoad, setHasInitialLoad] = useState(false);
  useEffect(() => {
    setBreadcrumbs([
      { children: <Link to="/dashboard/home">Início</Link> },
      { children: <Link to="/dashboard/entities">Entidades</Link> },
      { title: entityName }
    ]);
    
    // Set root context when viewing an entity
    if (entityName) {
      setRootNavigationContext({
        type: 'entity',
        data: { entityName }
      });
    }
  }, [entityName]);

  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      try {
        // Reset flags for new entity
        setHasInitialLoad(false);
        
        // Phase 1: Load websites quickly
        setIsLoadingWebsites(true);
        setWebsitesError(null);
        const response = await api.get(`/entity/websites/${entityName}`);
        const websites = response.data.result || [];

        if (isCancelled) return;

        const websitesRows = websites.map(item => ({
          id: item.WebsiteId,
          Name: item.Name,
          StartingUrl: item.StartingUrl,
          Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
          Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
          Declaration: item.Declaration === null ? "Não avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaração não conforme",
          edit: "Editar",
        }));

        setData(websitesRows);
        setOriginalData(websitesRows);
        setDataForCSV(websites.map(item => ({WebsiteId: item.WebsiteId, Name: item.Name})));
        setIsLoadingWebsites(false);
        setHasInitialLoad(true); // Mark initial load complete

        // Phase 2: Load pages and compute metrics
        setIsProcessingStats(true);
        const responsePages = await api.get(`/entity/websites/pages/${entityName}`);
        const pages = responsePages.data.result || [];

        if (isCancelled) return;
      const simplifiedPracticesData = getSimplifiedPracticesData(pages)
      setDataListDetails(simplifiedPracticesData.success.map(item => ({
        practice: t(`ELEMS.${item.practice}`),
        pages: item.pages,
        occurrences: item.occurrences,
        level: item.level.toUpperCase()
      })))
      setDataListDetailsBad(simplifiedPracticesData.errors.map(item => ({
        practice: t(`ELEMS.${item.practice}`),
        pages: item.pages,
        occurrences: item.occurrences,
        level: item.level.toUpperCase()
      })))

      // Process practices by WCAG Success Criteria
      const practicesBySuccessCriteria = {
        success: {},
        errors: {}
      };

      // Process successful practices
      simplifiedPracticesData.success.forEach(item => {
        const scs = item.scs;
        if (scs && scs !== '') {
          const criteriaList = scs.split(',');
          criteriaList.forEach(criteria => {
            const trimmedCriteria = criteria.trim();
            if (!practicesBySuccessCriteria.success[trimmedCriteria]) {
              practicesBySuccessCriteria.success[trimmedCriteria] = [];
            }
            practicesBySuccessCriteria.success[trimmedCriteria].push({
              practice: t(`ELEMS.${item.practice}`),
              pages: item.pages,
              occurrences: item.occurrences,
              level: item.level.toUpperCase(),
              websiteCount: item.pages
            });
          });
        }
      });

      // Process error practices
      simplifiedPracticesData.errors.forEach(item => {
        const scs = item.scs;
        if (scs && scs !== '') {
          const criteriaList = scs.split(',');
          criteriaList.forEach(criteria => {
            const trimmedCriteria = criteria.trim();
            if (!practicesBySuccessCriteria.errors[trimmedCriteria]) {
              practicesBySuccessCriteria.errors[trimmedCriteria] = [];
            }
            practicesBySuccessCriteria.errors[trimmedCriteria].push({
              practice: t(`ELEMS.${item.practice}`),
              pages: item.pages,
              occurrences: item.occurrences.toString().includes("lang") ? "N/A" : item.occurrences,
              level: item.level.toUpperCase(),
              websiteCount: item.pages
            });
          });
        }
      });

      // Format data for WCAG Success Criteria display
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

      const formattedSuccessData = formatSuccessCriteriaData(practicesBySuccessCriteria.success);
      const formattedErrorData = formatSuccessCriteriaData(practicesBySuccessCriteria.errors);

      setSuccessCriteriaSuccess(formattedSuccessData);
      setSuccessCriteriaErrors(formattedErrorData);

      const evaluatedPages = pages.filter(page => page.Evaluation_Date !== null);
      const averageScore = evaluatedPages.reduce((acc, page) => acc + Number(page.Score || 0), 0) / (evaluatedPages.length || 1);
      const oldestPage = moment(
        evaluatedPages.reduce((a, b) => new Date(a.Evaluation_Date) < new Date(b.Evaluation_Date) ? a : b)
          .Evaluation_Date
      ).format('D [de] MMMM [de] YYYY');
      const newestPage = moment(
        evaluatedPages.reduce((a, b) => new Date(a.Evaluation_Date) > new Date(b.Evaluation_Date) ? a : b)
          .Evaluation_Date
      ).format('D [de] MMMM [de] YYYY');
      const totalPages = pages.length;

      // Group pages by WebsiteId
      const websitePageMap = {};
      pages.forEach(page => {
        if (!websitePageMap[page.WebsiteId]) websitePageMap[page.WebsiteId] = [];
        websitePageMap[page.WebsiteId].push(page);
      });
      const totalWebsites = Object.keys(websitePageMap).length;
      const totalEvaluatedPages = Object.keys(websitePageMap).reduce((acc, websiteId) => acc + websitePageMap[websiteId].filter(page => page.Evaluation_Date !== null).length, 0);

      let conformantWebsites = 0;
      let nonConformantWebsites = 0;
      let conformCounts = { A: 0, AA: 0, AAA: 0 };
      Object.entries(websitePageMap).forEach(([websiteId, pageList]) => {
        const isNonConform = pageList.some(p => p.A > 0 || p.AA > 0 || p.AAA > 0);
        if (isNonConform) {
          nonConformantWebsites++;
        } else {
          conformantWebsites++;
          if (pageList.every(p => p.A <= 0)) conformCounts.A++;
          if (pageList.every(p => p.AA <= 0 && p.A <= 0)) conformCounts.AA++;
          if (pageList.every(p => p.AAA <= 0 && p.AA <= 0 && p.A <= 0)) conformCounts.AAA++;
        }
      });

      // Bar chart data: frequency is by website average score
      const websiteAverages = Object.values(websitePageMap).map(pageList => {
        const scores = pageList
          .filter(p => p.Evaluation_Date !== null)
          .map(p => Number(p.Score));
        const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return avg;
      });
      const barDataDynamicArr = [
        websiteAverages.filter(score => score >= 1 && score < 2).length,
        websiteAverages.filter(score => score >= 2 && score < 3).length,
        websiteAverages.filter(score => score >= 3 && score < 4).length,
        websiteAverages.filter(score => score >= 4 && score < 5).length,
        websiteAverages.filter(score => score >= 5 && score < 6).length,
        websiteAverages.filter(score => score >= 6 && score < 7).length,
        websiteAverages.filter(score => score >= 7 && score < 8).length,
        websiteAverages.filter(score => score >= 8 && score < 9).length,
        websiteAverages.filter(score => score >= 9 && score < 10).length,
      ];

      // Build radar websites data with domain and averageScore
      const websitesWithScores = Object.entries(websitePageMap).map(([websiteId, pageList]) => {
        const website = websites.find(w => w.WebsiteId.toString() === websiteId.toString());
        if(!website) {
          return null 
        }
        // Calculate average score for this website
        const scores = pageList
          .filter(p => p.Evaluation_Date !== null)
          .map(p => Number(p.Score));
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return {
          url: website.StartingUrl,
          averageScore: averageScore.toFixed(2)
        };
      });

      setRadarWebsites(websitesWithScores.filter(item => item !== null));
      setDataListBar(
        barDataDynamicArr.map((item, index) => ({
          range: `[${index + 1} - ${index + 2}[`,
          frequency: barDataDynamicArr[index],
          frequency_percent: `${((barDataDynamicArr[index] / totalWebsites) * 100).toFixed(2)}%`,
          cumulative: barDataDynamicArr.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0),
          cumulative_percent: `${((barDataDynamicArr.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0) / totalWebsites) * 100).toFixed(2)}%`
        }))
      );
      setBarDataDynamic({
        ...barData,
        datasets: [
          {
            type: 'bar',
            label: "Frequência (nº de sítios web)",
            data: barDataDynamicArr,
            backgroundColor: '#339',
            categoryPercentage: 1,
            barPercentage: 1,
            grouped: true,
          }
        ]
      });
      setListItems([
        { title: 'Pontuação média', value: averageScore.toFixed(1) },
        { title: 'Avaliação mais antiga de uma página', value: oldestPage },
        { title: 'Avaliação mais recente de uma página', value: newestPage },
        { title: 'Nº de Sítios Web', value: totalWebsites },
        { title: 'Nº de Páginas(Avaliadas)', value: `${totalPages} (${totalEvaluatedPages})` },
        { title: 'Nº médio de Páginas por Sítio', value: (totalPages / totalWebsites).toFixed(1) },
      ]);
      setListItemsGlobal([
        { title: 'Sítios Web', value: totalWebsites },
        { title: 'Sítios Web não conformes', value: nonConformantWebsites },
        {
          title: 'Sítios Web conformes', value: conformantWebsites,
          itemsList: [
            { title: 'Conformidade A', value: `${conformCounts.A} (${((conformCounts.A / totalWebsites) * 100).toFixed(1)}%)` },
            { title: 'Conformidade AA', value: `${conformCounts.AA} (${((conformCounts.AA / totalWebsites) * 100).toFixed(1)}%)` },
            { title: 'Conformidade AAA', value: `${conformCounts.AAA} (${((conformCounts.AAA / totalWebsites) * 100).toFixed(1)}%)` },
          ]
        },
      ]);
      // Don't overwrite table data - already set in Phase 1
      setIsProcessingStats(false);
      } catch (error) {
        setWebsitesError('Erro ao carregar dados da entidade');
        setIsLoadingWebsites(false);
        setIsProcessingStats(false);
        setHasInitialLoad(true); // Mark as complete even on error
      }
    };
    
    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [entityName, t]);
  const fetchDataWebsite = async () => {
    const response = await api.get(`/directory/${directoryName}/websites`);
    const websites = response.data.result || [];
    setData(websites.map(item => ({
      id: item.WebsiteId,
      Name: item.Name,
      StartingUrl: item.StartingUrl,
      Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
      Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
      Declaration: item.Declaration === null ? "Não avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaração não conforme",
      edit: "Editar",
    })));
  }
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
        setFeedbackMessage("Sítios web eliminados com sucesso!");
        setCheckboxesSelected([]);
        setData(originalData.filter(item => !websiteIds.includes(item.id)));
        setOriginalData(originalData.filter(item => !websiteIds.includes(item.id)));
      }
    } catch (error) {
      setFeedbackMessage("Erro ao eliminar sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  // Client-side search filtering for entity websites
  useEffect(() => {
    // Only run after initial load is complete
    if (!hasInitialLoad) return;
    
    if (search.trim() === '') {
      // No search, show all websites
      setData(originalData);
    } else {
      // Filter websites by search term (client-side)
      const filtered = originalData.filter(item => 
        item.Name?.toLowerCase().includes(search.toLowerCase()) ||
        item.StartingUrl?.toLowerCase().includes(search.toLowerCase())
      );
      setData(filtered);
    }
  }, [search, hasInitialLoad, originalData]);

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
      if (response.status === 201) {
        setFeedbackMessage("As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível.");
        setCheckboxesSelected([]);
        setShowModal(false);
        setSearch("");
        await fetchDataWebsite();
      }
    } catch (error) {
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
        dataForCSV,
        "Entidade"
      );
    } catch (error) {
      //TODO - handle error 
    }
  }
  return (
    <div>
      <Breadcrumb data={breadcrumbs || []} />
      <h1>{t('ENTITIES_PAGE.LIST.title', { entityName })}</h1>


      <ContentListWebSites
        title={t('WEBSITES_PAGE.LIST.subtitle_list', { entityName })}
        checkboxesSelected={checkboxesSelected}
        setCheckboxesSelected={setCheckboxesSelected}
        data={data}
        setData={setData}
        handleSearchChange={e => setSearch(e.target.value)}
        onDeleteWebsites={handleDeleteWebsites}
        onDeletePagesWebsites={handleDeletePagesWebsites}
        onReevaluateWebsites={handleReevaluateWebsites}
        onCrawlWebsites={handleOpenCrawlingModal}
        serverSidePagination={false}
      />
      <div className="bg-white mt-5">
        <div>
          <h2>{t('ENTITIES_PAGE.LIST.export_data')}</h2>
          <p>{t('ENTITIES_PAGE.LIST.export_data_description', { entityName })}</p>
        </div>
        <div className="d-flex justify-content-start align-items-end">
          <Button
            darkTheme={theme}
            text={t('ENTITIES_PAGE.LIST.export_csv')}
            className="btn-primary"
            disabled={data.length === 0}
            onClick={handleExportCSV}
          />
        </div>
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">{t('ENTITIES_PAGE.LIST.global_indicators')}</h2>
        {isProcessingStats ? (
          <p className="text-muted">A calcular indicadores...</p>
        ) : (
          <Indicators listItems={listItems} />
        )}
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Conformidade global da Entidade</h2>
        {isProcessingStats ? (
          <p className="text-muted">A calcular conformidade...</p>
        ) : (
          <Indicators listItems={listItemsGlobal} />
        )}
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo da Entidade</h2>
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
          <RadarGraph darkTheme={theme} labelDataSet="Pontuação por sítio Web" websites={radarWebsites} showTabs={true} />
        )}
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
        {isProcessingStats ? (
          <p className="text-muted">A calcular práticas...</p>
        ) : (
          <SortingTable
            hasSort={false}
            headers={detailsTableHeaders || []}
            dataList={dataListDetails || []}
            columnsOptions={columnsOptionsDetails || {}}
            darkTheme={theme}
            pagination={false}
            ariaLabels={ariaLabels || {}}
            links={false}
            caption="Distribuição detalhada das melhores práticas"
            setDataList={() => { }}
            nextPage={() => { }}
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[]}
            iconsAltTexts={[]}
            paginationButtonsTexts={[]}
            project=""
            setCheckboxesSelected={() => { }}
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
            headers={detailsTableHeaders || []}
            dataList={dataListDetailsBad || []}
            columnsOptions={columnsOptionsDetails || {}}
            darkTheme={theme}
            pagination={false}
            links={false}
            ariaLabels={ariaLabels || {}}
            caption="Distribuição detalhada das piores práticas"
            setDataList={() => { }}
            nextPage={() => { }}
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[]}
            iconsAltTexts={[]}
            paginationButtonsTexts={[]}
            project=""
            setCheckboxesSelected={() => { }}
          />
        )}
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Práticas por Critério de Sucesso WCAG 2.1</h2>
        {isProcessingStats ? (
          <p className="text-muted">A processar critérios de sucesso...</p>
        ) : (
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
              .map(([criteriaCode, criteriaData]) => (
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
        )}
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
  )
}

// Export memoized component to prevent unnecessary re-renders
const ViewEntities = memo(ViewEntitiesComponent);

export default ViewEntities;