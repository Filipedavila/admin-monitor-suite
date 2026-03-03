import { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Button, StatisticsHeader, Breadcrumb, SortingTable } from "ama-design-system";
import "./style.users.css";
import { RadarGraph } from "../../components/RadarGraph/index.jsx";
import GoodBadTab from "../../components/GoodBadTab/GoodBadTab.jsx";
import { Link, useLocation, useParams } from "react-router-dom";
import { BarLineGraphTabs } from "../../components/BarLineGraph/index.jsx";
import ContentListPages from "../Pages/components/ContentListPage.jsx";
import {
  dataHeaders as dataHeadersBad,
  columnsOptions as columnsOptionsBad,
  dataRows as dataRowsBad
} from "../../components/GoodBadTab/table.config.jsx";
import { barOptionsDark, optionsHorizontalBar, optionsHorizontalBarDark } from "./table.config.jsx";
import {
  barData,
  barOptions,
  dataHeaders as dataHeadersBar,
  columnsOptions as columnsOptionsBar,
} from "../../components/BarLineGraph/table.config.jsx";
import { useTheme } from '../../context/ThemeContext';
import {
  dataRows as dataRowsBar
} from "../Pages/table.config.jsx";
import { useTranslation } from "react-i18next";
import Indicators from "../../components/Indicators";
import { api } from "../../config/api";
import moment from "moment";
import tests from "../../utils/tests.js";
import { downloadCSV, downloadWebsiteCSV, getData, getSimplifiedPracticesData } from "../../utils/utils.js";
import { isRequestSuccessful } from "../../utils/apiHelpers.js";
import { Modal } from "../../components/Modal";
import { getEffectiveNavigationContext, setWebsiteNavigationContext } from "../../utils/navigation";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";

// Function to calculate total elements from JSON string
const calculateTotalElements = (elementCountJson) => {
  try {
    if (!elementCountJson) return 0;
    const parsed = JSON.parse(elementCountJson);
    return Object.values(parsed).reduce((total, count) => total + count, 0);
  } catch (error) {
    console.error('Error parsing Element_Count JSON:', error);
    return 0;
  }
};

// Function to decode and format errors from base64
const decodeAndFormatErrors = (errorsBase64) => {
  try {
    if (!errorsBase64) return [];

    // Decode base64 to string
    const decodedString = atob(errorsBase64);

    // Parse JSON
    const errorsData = JSON.parse(decodedString);

    // You'll need to define your tests object with level information
    // This is a placeholder - replace with your actual tests mapping


    const errors = [];
    for (const key in errorsData || {}) {
      if (errorsData[key] && errorsData[key] > 0) {
        errors.push({
          key,
          n_elems: errorsData[key], // This is the count of errors for this test
          n_pages: 1, // This page has this error
          lvl: tests[key]?.level?.toUpperCase() || 'UNKNOWN',
          description: tests[key]?.test || `Test ${key}`, // Use the test name as description
          elem: tests[key]?.elem || 'unknown' // Element type
        });
      }
    }

    return errors;
  } catch (error) {
    console.error('Error decoding/parsing Errors field:', error);
    return [];
  }
};

// Function to get top 5 most common errors by level
const getTop5ErrorsByLevel = (allPagesData) => {
  const errorsByLevel = { A: [], AA: [], AAA: [] };

  // Collect all errors from all pages
  const allErrors = {};

  allPagesData.forEach(page => {
    const pageErrors = decodeAndFormatErrors(page.Errors);
    pageErrors.forEach(error => {
      if (!allErrors[error.key]) {
        allErrors[error.key] = {
          key: error.key,
          lvl: error.lvl,
          total_elems: 0,
          total_pages: 0,
          description: error.description || `Test ${error.key}`,
          elem: error.elem || 'unknown'
        };
      }
      allErrors[error.key].total_elems += error.n_elems;
      allErrors[error.key].total_pages += error.n_pages;
    });
  });

  // Group by level and sort by frequency
  Object.values(allErrors).forEach(error => {
    if (error.lvl === 'A' || error.lvl === 'AA' || error.lvl === 'AAA') {
      errorsByLevel[error.lvl].push(error);
    }
  });

  // Sort each level by total elements (most common first) and take top 5
  Object.keys(errorsByLevel).forEach(level => {
    errorsByLevel[level] = errorsByLevel[level]
      .sort((a, b) => b.total_elems - a.total_elems)
      .slice(0, 5)
      .map(error => ({
        level: error.lvl,
        practice: error.key,
        description: error.description
      }));
  });

  return errorsByLevel;
};

const ViewWebSitesComponent = () => {
  const { t } = useTranslation();
  const { websiteName, id } = useParams();
  const { theme } = useTheme();
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([
    { children: <Link to="/dashboard/home">Início</Link> },
  ]);
  const [data, setData] = useState([]);
  const [dataBad, setDataBad] = useState(dataRowsBad);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [listItems, setListItems] = useState([]);
  const [listItemsGlobal, setListItemsGlobal] = useState([]);
  const [barDataDynamic, setBarDataDynamic] = useState(barData);
  const [dataListBar, setDataListBar] = useState([]);
  const [radarWebsites, setRadarWebsites] = useState([]);
  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  // Issue #60: Using only allPagesData for client-side sorting/pagination
  const [allPagesData, setAllPagesData] = useState([]);
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

  useEffect(() => {
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
  }, [websiteName]);
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
    const fetchData = async () => {
      // Issue #60: Fetch ALL pages for proper client-side sorting
      // Only one API call needed - fetch all pages at once
      const responsePages = await api.get(`/website/${encodeURIComponent(websiteName)}/user/admin/pages`);
      const pagesData = responsePages.data.result || [];
      console.log('Pages API Response - Total pages:', pagesData.length);
      setTotalItems(pagesData.length);
      
      // Transform all pages data once
      // Ensure we always have a valid, unique id for each row (some pages may have null/undefined PageId)
      const allTransformedPages = pagesData.map((page, index) => ({
        id: page.PageId ?? index,
        Uri: page.Uri,
        Score: page.Score ?? 0,
        Evaluation_Date: page.Evaluation_Date ? moment(page.Evaluation_Date).format('DD/MM/YYYY') : 'Pendente',
        Evaluation_Date_Raw: page.Evaluation_Date, // Keep raw date for sorting
        Element_Count: calculateTotalElements(page.Element_Count),
        A: page.A ?? 0,
        AA: page.AA ?? 0,
        AAA: page.AAA ?? 0,
        e: "?",
        OPAW: page.Show_In ? (page.Show_In.split("")[2] === "1" ? "Sim" : "Nao") : "Nao",
      }));
      
      // Use only allPagesData - single source of truth
      setAllPagesData(allTransformedPages);
      const response = await api.get(`/website/info/${id}`);
      const website = response.data.result || [];


      const evaluatedPages = pagesData.filter(page => page.Evaluation_Date !== null);
      const totalPages = pagesData.length;


      let websiteList = []
      let websiteListForWebsitePage = []
      getData(website, pagesData, websiteList, websiteListForWebsitePage, moment);
      websiteListForWebsitePage = websiteListForWebsitePage[0];
      setListItems([
        { title: 'Pontuação média', value: websiteListForWebsitePage.score.toFixed(1) },
        { title: 'Avaliação mais antiga de uma página', value: websiteListForWebsitePage.oldestPage ? moment(websiteListForWebsitePage.oldestPage).format('DD/MM/YYYY') : 'N/A' },
        { title: 'Avaliação mais recente de uma página', value: websiteListForWebsitePage.recentPage ? moment(websiteListForWebsitePage.recentPage).format('DD/MM/YYYY') : 'N/A' },
        { title: 'Nº de páginas recolhidas(avaliadas)', value: `${websiteListForWebsitePage.nPages}(${evaluatedPages.length})` },
      ]);
      setListItemsGlobal([
        { title: 'Páginas Avaliadas', value: totalPages },
        { title: 'Páginas Não Conformes', value: websiteListForWebsitePage.pagesWithErrors },
        {
          title: 'Páginas Conformes', value: websiteListForWebsitePage.pagesWithoutErrors,
          itemsList: [
            { title: 'Conformidade A', value: `${websiteListForWebsitePage.pagesWithoutErrorsA} (${((websiteListForWebsitePage.pagesWithoutErrorsA / totalPages) * 100).toFixed(1)}%)` },
            { title: 'Conformidade AA', value: `${websiteListForWebsitePage.pagesWithoutErrorsAA} (${((websiteListForWebsitePage.pagesWithoutErrorsAA / totalPages) * 100).toFixed(1)}%)` },
            { title: 'Conformidade AAA', value: `${websiteListForWebsitePage.pagesWithoutErrorsAAA} (${((websiteListForWebsitePage.pagesWithoutErrorsAAA / totalPages) * 100).toFixed(1)}%)` },
          ]
        },
      ]);

      // Bar chart: frequency by page score (not website average since it's a single website)
      const barDataDynamicArr = websiteListForWebsitePage.scoreDistributionFrequency;
     
      // Build radar websites data with page URLs and scores for this single website view
      const pagesWithScores = pagesData.map(page => {
        return {
          domain: page.Uri,
          averageScore: Number(page.Score).toFixed(1)
        };
      });
      setRadarWebsites(pagesWithScores);
      setDataListBar(
        barDataDynamicArr.map((item, index) => ({
          range: `[${index + 1} - ${index + 2}[`,
          frequency: item,
          frequency_percent: `${((barDataDynamicArr[index] / totalPages) * 100).toFixed(2)}%`,
          cumulative: barDataDynamicArr.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0),
          cumulative_percent: `${((barDataDynamicArr.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0) / totalPages) * 100).toFixed(2)}%`
        }))
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

      setHorizontalDataGood({
        labels: websiteListForWebsitePage.successDetailsTable.practicesData.map(practice => t(`TESTS_RESULTS.${practice.key}.${practice.nOccurrences > 1 ? "p" : "s"}`)) ?? [],
        datasets: [
          {
            label: "Nº de Páginas",
            type: 'bar',
            data: websiteListForWebsitePage.successDetailsTable.practicesData.map(practice => Number(practice.nOccurrences)) ?? [],
            backgroundColor: "green",
            borderWidth: 0,
          }
        ]
      });
      setHorizontalDataBad({
        labels: websiteListForWebsitePage.errorsDetailsTable.practicesData?.map(practice => t(`TESTS_RESULTS.${practice.key}.${practice.nOccurrences > 1 ? "p" : "s"}`)),
        datasets: [
          {
            label: "Nº de Páginas",
            type: 'bar',
            data: websiteListForWebsitePage.errorsDetailsTable.practicesData?.map(practice => Number(practice.nOccurrences)),
            backgroundColor: "red",
            borderWidth: 0,
          }
        ]
      });
      setDataBad(websiteListForWebsitePage.errorsDetailsTable.practicesData.map(practice => ({
        name: t(`TEST_RESULTS.${practice.key}`),
        praticesPerPage: 1,
        pages: practice.n_pages,
        occurences: practice.nOccurrences,
        level: practice.lvl
      })))

      setDataGood(websiteListForWebsitePage.successDetailsTable.practicesData.map(practice => ({
        name: t(`TEST_RESULTS.${practice.key}`),
        praticesPerPage: 1,
        pages: practice.n_pages,
        occurences: practice.nOccurrences,
        level: practice.lvl
      })))

      setTopGoodPracticesA(websiteListForWebsitePage.successDetailsTable.practicesData.filter(practice => practice.lvl === "A").sort((a, b) => b.nOccurrences - a.nOccurrences).slice(0, 5).map(practice => ({
        level: practice.lvl,
        practice: t(`TESTS_RESULTS.${practice.key}.${practice.nOccurrences > 1 ? "p" : "s"}`),
      })));
      setTopGoodPracticesAA(websiteListForWebsitePage.successDetailsTable.practicesData.filter(practice => practice.lvl === "AA").sort((a, b) => b.nOccurrences - a.nOccurrences).slice(0, 5).map(practice => ({
        level: practice.lvl,
        practice: t(`TESTS_RESULTS.${practice.key}.${practice.nOccurrences > 1 ? "p" : "s"}`),
      })));
      setTopGoodPracticesAAA(websiteListForWebsitePage.successDetailsTable.practicesData.filter(practice => practice.lvl === "AAA").sort((a, b) => b.nOccurrences - a.nOccurrences).slice(0, 5).map(practice => ({
        level: practice.lvl,
        practice: t(`TESTS_RESULTS.${practice.key}.${practice.nOccurrences > 1 ? "p" : "s"}`),
      })));
      setTopBadPracticesA(websiteListForWebsitePage.errorsDetailsTable.practicesData.filter(practice => practice.lvl === "A").sort((a, b) => b.nOccurrences - a.nOccurrences).slice(0, 5).map(practice => ({
        level: practice.lvl,
        practice: t(`TESTS_RESULTS.${practice.key}.${practice.nOccurrences > 1 ? "p" : "s"}`),
      })));
      setTopBadPracticesAA(websiteListForWebsitePage.errorsDetailsTable.practicesData.filter(practice => practice.lvl === "AA").sort((a, b) => b.nOccurrences - a.nOccurrences).slice(0, 5).map(practice => ({
        level: practice.lvl,
        practice: t(`TESTS_RESULTS.${practice.key}.${practice.nOccurrences > 1 ? "p" : "s"}`),
      })));
      setTopBadPracticesAAA(websiteListForWebsitePage.errorsDetailsTable.practicesData.filter(practice => practice.lvl === "AAA").sort((a, b) => b.nOccurrences - a.nOccurrences).slice(0, 5).map(practice => ({
        level: practice.lvl,
        practice: t(`TESTS_RESULTS.${practice.key}.${practice.nOccurrences > 1 ? "p" : "s"}`),
      })));

      // Process practices by WCAG Success Criteria using simplified practices data
      const simplifiedPracticesData = getSimplifiedPracticesData(pagesData);

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
              websiteCount: 1 // For single website view
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
              websiteCount: 1 // For single website view
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
    };
    fetchData();
  }, []);


  // Note: fetchWebsitePages removed - using client-side sorting/pagination now (Issue #60)
  
  // Handle search change - for client-side filtering
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleDeletePages = async () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos uma página para eliminar.");
      setShowFeedbackModal(true);
      return;
    }

    const pagesIds = checkboxesSelected.map(item => item.id);
    
    try {
      const response = await api.post("/page/delete", {
        pages: pagesIds,
      });

      const deletedSuccessfully =
        isRequestSuccessful(response) ||
        response?.status === 200 ||
        response?.status === 201;

      if (deletedSuccessfully) {
        setFeedbackMessage("Páginas excluídas com sucesso!");
        setCheckboxesSelected([]);
        
        // Remove deleted pages from allPagesData
        const deletedIds = checkboxesSelected.map(item => item.id);
        const updatedData = allPagesData.filter(item => !deletedIds.includes(item.id));
        setAllPagesData(updatedData);
        setTotalItems(updatedData.length);
      } else {
        setFeedbackMessage("Erro ao excluir páginas!");
      }
    } catch (error) {
      console.error("Error deleting pages:", error);
      setFeedbackMessage("Erro ao excluir páginas!");
    }
    
    setShowFeedbackModal(true);
  };

  const handleExportCSV = async () => {
    try {
      downloadWebsiteCSV(
       websiteName,
       "evaluation",
       t
      );
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  }
  const handleReevaluatePages = async () => {
    const pagesIds = checkboxesSelected.map(item => item.Uri);
    const response = await api.post("/page/reEvaluateMulti", {
      pages: pagesIds,
    });
    console.log(response.status);
    if (response.status === 201) {
      setFeedbackMessage("A reavaliação foi iniciada com sucesso!");
      setShowFeedbackModal(true);
    } else {
      setFeedbackMessage("Erro ao iniciar a reavaliação!");
      setShowFeedbackModal(true);
    }
  }
  const handleImport = async () => {
    const websitesSelectedUris = checkboxesSelected.map(item => item.Uri);

    const response = await api.post(`page/add`, {
      uris:"[]",
      observatory: JSON.stringify(websitesSelectedUris),
      websiteId: Number(id),
    });
    
    if(response.status === 200 || response.status === 201){

        setOpenModal(true);
      setFeedbackMessage('As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível.');
    } else {
      setFeedbackMessage('Erro inesperado ao importar');
    }
   }

   const handleShowHideObservatory = async () => {
    await Promise.all(checkboxesSelected.map(async item => {
      const response = await api.post(`/page/update`, {
        pageId: item.id,
        checked: item.OPAW === "Sim" ? false : true  // false = hide from Observatory, true = show in Observatory
      });
    }));

    setFeedbackMessage('As páginas foram adicionadas ao observatório com sucesso!');
    setShowFeedbackModal(true);
    setCheckboxesSelected([]);
    await fetchWebsitesPages();
   }

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t('WEBSITES_PAGE.LIST.title', { websiteName })}</h1>
      <div className="content bg-white">
        <h2>{t('WEBSITES_PAGE.LIST.subtitle', { websiteName })}</h2>
        <ContentListPages
          checkboxesSelected={checkboxesSelected}
          setCheckboxesSelected={setCheckboxesSelected}
          data={allPagesData}
          setData={setAllPagesData}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          search={search}
          handleSearchChange={handleSearchChange}
          handleDeletePages={handleDeletePages}
          handleReevaluatePages={handleReevaluatePages}
          handleShowHideObservatory={handleShowHideObservatory}
          useClientSideSorting={true}
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
        <BarLineGraphTabs
          barData={barDataDynamic}
          barOptions={theme === "light" ? barOptions : barOptionsDark}
          columnsOptions={columnsOptionsBar}
          dataHeaders={dataHeadersBar}
          dataList={dataListBar}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Boas Práticas de acessibilidade encontradas no sítio web        </h2>
        <BarLineGraphTabs
          barData={horizontalDataGood}
          barOptions={theme === "light" ? optionsHorizontalBar : optionsHorizontalBarDark}
          columnsOptions={columnsOptionsBad}
          dataHeaders={dataHeadersBad}
          dataList={dataBad}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Más Práticas de acessibilidade encontradas no sítio web        </h2>
        <BarLineGraphTabs
          barData={horizontalDataBad}
          barOptions={theme === "light" ? optionsHorizontalBar : optionsHorizontalBarDark}
          columnsOptions={columnsOptionsBad}
          dataHeaders={dataHeadersBad}
          dataList={dataBad}
        />
      </div>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
        <RadarGraph websites={radarWebsites} labelDataSet="Pontuação por página" darkTheme={theme} showTabs={true} />
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
            practice: { type: "Text", center: false, bold: false },
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
            practice: { type: "Text", center: false, bold: false },
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
            practice: { type: "Text", center: false, bold: false },
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
            practice: { type: "Text", center: false, bold: false },
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
            practice: { type: "Text", center: false, bold: false },
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
            practice: { type: "Text", center: false, bold: false },
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
        <p>{feedbackMessage}</p>
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
