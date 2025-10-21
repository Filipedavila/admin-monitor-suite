import React, { useState, useEffect, useMemo, memo } from "react";
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
import { set } from "lodash";

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
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

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
    setOriginalData(websites.map(item => ({
      id: item.WebsiteId,
      Name: item.Name,
      StartingUrl: item.StartingUrl,
      Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
      Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
      Declaration: item.Declaration === null ? "Não avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaração não conforme",
      edit: "Editar",
    })));

  }
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get(`/directory/${encodeURIComponent(directoryName)}/websites`);
      const responsePages = await api.get(`/directory/${encodeURIComponent(directoryName)}/websites/pages`);

      const pages = responsePages.data.result || [];
      const websites = response.data.result || [];

      const simplifiedPracticesData = getSimplifiedPracticesData(pages)
      setDataListDetails(simplifiedPracticesData.success?.map(item => ({
        practice: t(`ELEMS.${item.practice}`),
        pages: item.pages,
        occurrences: item.occurrences,
        level: item.level.toUpperCase()
      })))
      setDataListDetailsBad(simplifiedPracticesData.errors?.map(item => ({
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
              occurrences: item.occurrences,
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
      ).format('DD/MM/YY');

      const newestPage = moment(
        evaluatedPages.reduce((a, b) => new Date(a.Evaluation_Date) > new Date(b.Evaluation_Date) ? a : b)
          .Evaluation_Date
      ).format('DD/MM/YY');

      const totalPages = pages.length;


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

          if (pageList.every(p => p.A === 0)) conformCounts.A++;
          if (pageList.every(p => p.AA === 0)) conformCounts.AA++;
          if (pageList.every(p => p.AAA === 0)) conformCounts.AAA++;
        }

      });


      const barDataDynamic = [
        pages.filter(page => page.Score >= 1 && page.Score < 2).length,
        pages.filter(page => page.Score >= 2 && page.Score < 3).length,
        pages.filter(page => page.Score >= 3 && page.Score < 4).length,
        pages.filter(page => page.Score >= 4 && page.Score < 5).length,
        pages.filter(page => page.Score >= 5 && page.Score < 6).length,
        pages.filter(page => page.Score >= 6 && page.Score < 7).length,
        pages.filter(page => page.Score >= 7 && page.Score < 8).length,
        pages.filter(page => page.Score >= 8 && page.Score < 9).length,
        pages.filter(page => page.Score >= 9 && page.Score < 10).length,
      ]

      const websiteAverageScores = Object.values(websitePageMap).map(pageList => {
        const scores = pageList
          .filter(p => p.Evaluation_Date !== null)
          .map(p => Number(p.Score));
        const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
        return average.toFixed(1);
      });
     
      
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
        barDataDynamic.map((item, index) => ({
          range: `[${index + 1} - ${index + 2}[`,
          frequency: barDataDynamic[index],
          frequency_percent: `${((barDataDynamic[index] / totalPages) * 100).toFixed(2)}%`,
          cumulative: barDataDynamic.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0),
          cumulative_percent: `${((barDataDynamic.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0) / totalPages) * 100).toFixed(2)}%`
        }))
      )

      setBarDataDynamic({
        ...barData,
        datasets: [
          {
            type: 'bar',
            label: "Frequência (nº de páginas)",
            data: barDataDynamic,
            backgroundColor: '#339', // All bars same color
            categoryPercentage: 1,
            barPercentage: 1,
            grouped: true,
          }
        ]
      })
      setListItems([
        { title: 'Pontuação média', value: Math.round(averageScore) },
        { title: 'Avaliação mais antiga de uma página', value: oldestPage },
        { title: 'Avaliação mais recente de uma página', value: newestPage },
        { title: 'Nº de Sítios Web', value: totalWebsites },
        { title: 'Nº de Páginas(Avaliadas)', value: `${totalPages} (${totalEvaluatedPages})` },
        { title: 'Nº médio de Páginas por Sítio', value: Math.round(totalPages / totalWebsites) },
      ]);

      setListItemsGlobal([
        { title: 'Sítios Web', value: totalWebsites },
        { title: 'Sítios Web não conformes', value: nonConformantWebsites },
        {
          title: 'Sítios Web conformes', value: conformantWebsites,
          itemsList: [
            { title: 'A', value: `${conformCounts.A} (${((conformCounts.A / totalWebsites) * 100).toFixed(2)}%)` },
            { title: 'AA', value: `${conformCounts.AA} (${((conformCounts.AA / totalWebsites) * 100).toFixed(2)}%)` },
            { title: 'AAA', value: `${conformCounts.AAA} (${((conformCounts.AAA / totalWebsites) * 100).toFixed(2)}%)` },
          ]
        },
      ]);
      setData(websites.map(item => ({
        id: item.WebsiteId,
        Name: item.Name,
        StartingUrl: item.StartingUrl,
        Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
        Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
        Declaration: item.Declaration === null ? "Não avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaração não conforme",
        edit: "Editar",
      })));
      setOriginalData(
        websites.map(item => ({
          id: item.WebsiteId,
          Name: item.Name,
          StartingUrl: item.StartingUrl,
          Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
          Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
          Declaration: item.Declaration === null ? "Não avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaração não conforme",
          edit: "Editar",
        }))
      )
    };

    fetchData();
  }, [directoryName]);

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Global</Link> },
    { children: <Link to="/dashboard/directories">Diretórios</Link> },
    { title: "Directório" }
  ];

  const [barDataDynamic, setBarDataDynamic] = useState(barData);
  const barOptionsCopy = JSON.parse(JSON.stringify(barOptions || {}));
  // Server-side pagination & search for directory websites
  useEffect(() => {
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
          Declaration: item.Declaration === null ? "Não avaliado" : item.Declaration === 1 ? "Selo de Ouro" : item.Declaration === 2 ? "Selo de Prata" : item.Declaration === 3 ? "Selo de Bronze" : "Declaração não conforme",
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
        <Indicators listItems={listItems} />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Conformidade global do Diretório</h2>
        <Indicators listItems={listItemsGlobal} />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo do Diretório</h2>
        <BarLineGraphTabs
          columnsOptions={columnsOptionsBar}
          barData={barDataDynamic}
          barOptions={theme === "light" ? barOptionsCopy : barOptionsDark}
          dataHeaders={dataHeadersBar}
          dataList={dataListBar}
          darkTheme={theme}
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
        <RadarGraph darkTheme={theme} labelDataSet="Pontuação por sítio Web" websites={radarWebsites}showTabs={true} />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
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
          setCheckboxesSelected={() => { }}
        />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Distribuição detalhada das piores práticas</h2>
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
          setCheckboxesSelected={() => { }}
        />
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
