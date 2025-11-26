import React, { useState, useEffect, useMemo, memo } from "react";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import { Button, StatisticsHeader, Breadcrumb, SortingTable, RadioGroup } from "ama-design-system";
import { BarLineGraphTabs } from "../../components/BarLineGraph";
import { RadarGraph } from "../../components/RadarGraph";
import GoodBadTab from "../../components/GoodBadTab/GoodBadTab";
import { useTheme } from "../../context/ThemeContext";
import ContentListWebSites from "../Websites/components/ContentListWebSites";
import { dataRows as dataRowsWebSites, barOptionsDark } from "../Websites/table.config.jsx";
import {
  barData,
  barOptions,
  dataHeaders as dataHeadersBar,
  columnsOptions as columnsOptionsBar,
} from "../../components/BarLineGraph/table.config.jsx";
import Indicators from "../../components/Indicators";
import { detailsTableHeaders, columnsOptionsDetails, ariaLabels } from "./table.config.jsx";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import moment from "moment";
import { downloadCSV, getSimplifiedPracticesData } from "../../utils/utils.js";
import tests from "../../utils/tests.js";
import { Modal } from "../../components/Modal";
import CrawlingModal from "../../components/CrawlingModal";
import { setRootNavigationContext } from "../../utils/navigation";

const ViewCategoriesComponent = () => {
  const { t } = useTranslation();
  const { categoryName } = useParams();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  // Breadcrumbs
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // List & search
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [search, setSearch] = useState("");
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);

  // Charts & indicators
  const [radarWebsites, setRadarWebsites] = useState([]);
  const [barDataDynamic, setBarDataDynamic] = useState(barData);
  const [dataListBar, setDataListBar] = useState([]);
  const [listItems, setListItems] = useState([]);
  const [listItemsGlobal, setListItemsGlobal] = useState([]);

  // Success criteria
  const initialSuccessCriteria = useMemo(() => ({}), []);
  const [successCriteriaSuccess, setSuccessCriteriaSuccess] = useState(initialSuccessCriteria);
  const [successCriteriaErrors, setSuccessCriteriaErrors] = useState(initialSuccessCriteria);
  const [dataListDetails, setDataListDetails] = useState([]);
  const [dataListDetailsBad, setDataListDetailsBad] = useState([]);

  // Modals & feedback
  const [radioValue, setRadioValue] = useState("1"); // "1" = all, "2" = observatory
  const [showModal, setShowModal] = useState(false); // Re-evaluate
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCrawlingModal, setShowCrawlingModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [counter, setCounter] = useState(0);
  // -------- Breadcrumbs / Path memory ----------
  useEffect(() => {
    setBreadcrumbs([
      { children: <Link to="/dashboard/home">Início</Link> },
      { children: <Link to="/dashboard/categories">Categorias</Link> },
      { title: categoryName }
    ]);
    
    // Set root context when viewing a category
    if (categoryName) {
      setRootNavigationContext({
        type: 'category',
        data: { categoryName }
      });
    }
  }, [categoryName]);

  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

  // -------- Fetch (reutilizável após ações) ----------
  const fetchDataWebsites = async () => {
    const response = await api.get(`/tag/${categoryName}/user/admin/websites`);
    const responsePages = await api.get(`/tag/${categoryName}/websites/pages`);

    const pages = responsePages.data.result || [];
    const websites = response.data.result || [];

    // Indicadores & gráficos
    const evaluatedPages = pages.filter(page => page.Evaluation_Date !== null);
    const averageScore =
      evaluatedPages.reduce((acc, page) => acc + Number(page.Score || 0), 0) /
      (evaluatedPages.length || 1);

    const oldestPage = evaluatedPages.length
      ? moment(
          evaluatedPages.reduce((a, b) =>
            new Date(a.Evaluation_Date) < new Date(b.Evaluation_Date) ? a : b
          ).Evaluation_Date
        ).format('DD/MM/YYYY')
      : "-";

    const newestPage = evaluatedPages.length
      ? moment(
          evaluatedPages.reduce((a, b) =>
            new Date(a.Evaluation_Date) > new Date(b.Evaluation_Date) ? a : b
          ).Evaluation_Date
        ).format('DD/MM/YYYY')
      : "-";

    const totalPages = pages.length;

    // Group by WebsiteId
    const websitePageMap = {};
    pages.forEach(page => {
      if (!websitePageMap[page.WebsiteId]) websitePageMap[page.WebsiteId] = [];
      websitePageMap[page.WebsiteId].push(page);
    });

    const totalWebsites = Object.keys(websitePageMap).length;
    const totalEvaluatedPages = Object.keys(websitePageMap).reduce(
      (acc, websiteId) =>
        acc + websitePageMap[websiteId].filter(p => p.Evaluation_Date !== null).length,
      0
    );

    let conformantWebsites = 0;
    let nonConformantWebsites = 0;
    let conformCounts = { A: 0, AA: 0, AAA: 0 };
    Object.values(websitePageMap).forEach(pageList => {
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

    // Bar chart
    const barDataDynamicArr = [
      pages.filter(page => page.Score >= 1 && page.Score < 2).length,
      pages.filter(page => page.Score >= 2 && page.Score < 3).length,
      pages.filter(page => page.Score >= 3 && page.Score < 4).length,
      pages.filter(page => page.Score >= 4 && page.Score < 5).length,
      pages.filter(page => page.Score >= 5 && page.Score < 6).length,
      pages.filter(page => page.Score >= 6 && page.Score < 7).length,
      pages.filter(page => page.Score >= 7 && page.Score < 8).length,
      pages.filter(page => page.Score >= 8 && page.Score < 9).length,
      pages.filter(page => page.Score >= 9 && page.Score < 10).length,
    ];

    const websiteAverageScores = Object.values(websitePageMap).map(pageList => {
      const scores = pageList.filter(p => p.Evaluation_Date !== null).map(p => Number(p.Score));
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
      barDataDynamicArr.map((_, index) => ({
        range: `[${index + 1} - ${index + 2}[`,
        frequency: barDataDynamicArr[index],
        frequency_percent: `${((barDataDynamicArr[index] / totalPages) * 100 || 0).toFixed(2)}%`,
        cumulative: barDataDynamicArr.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0),
        cumulative_percent: `${(
          (barDataDynamicArr.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0) / totalPages || 0) *
          100
        ).toFixed(2)}%`
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

    setListItems([
      { title: 'Pontuação média', value: Math.round(averageScore) },
      { title: 'Avaliação mais antiga de uma página', value: oldestPage },
      { title: 'Avaliação mais recente de uma página', value: newestPage },
      { title: 'Nº de Sítios Web', value: totalWebsites },
      { title: 'Nº de Páginas(Avaliadas)', value: `${totalPages} (${totalEvaluatedPages})` },
      { title: 'Nº médio de Páginas por Sítio', value: totalWebsites ? Math.round(totalPages / totalWebsites) : 0 },
    ]);

    setListItemsGlobal([
      { title: 'Sítios Web', value: totalWebsites },
      { title: 'Sítios Web não conformes', value: nonConformantWebsites },
      {
        title: 'Sítios Web conformes', value: conformantWebsites,
        itemsList: [
          { title: 'A', value: `${conformCounts.A} (${((conformCounts.A / (totalWebsites || 1)) * 100).toFixed(2)}%)` },
          { title: 'AA', value: `${conformCounts.AA} (${((conformCounts.AA / (totalWebsites || 1)) * 100).toFixed(2)}%)` },
          { title: 'AAA', value: `${conformCounts.AAA} (${((conformCounts.AAA / (totalWebsites || 1)) * 100).toFixed(2)}%)` },
        ]
      },
    ]);

    const websitesRows = websites.map(item => ({
      id: item.WebsiteId,
      Name: item.Name,
      StartingUrl: item.StartingUrl,
      Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
      Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
      Declaration:
        item.Declaration === null ? "Não avaliado" :
        item.Declaration === 1 ? "Selo de Ouro" :
        item.Declaration === 2 ? "Selo de Prata" :
        item.Declaration === 3 ? "Selo de Bronze" :
        "Declaração não conforme",
      edit: "Editar",
    }));

    setData(websitesRows);
    setOriginalData(websitesRows);

    // Práticas (WCAG)
    const simplifiedPracticesData = getSimplifiedPracticesData(pages);
    setDataListDetails(
      simplifiedPracticesData.success.map(item => ({
        practice: t(`ELEMS.${item.practice}`),
        pages: item.pages,
        occurrences: item.occurrences,
        level: item.level.toUpperCase()
      }))
    );
    setDataListDetailsBad(
      simplifiedPracticesData.errors.map(item => ({
        practice: t(`ELEMS.${item.practice}`),
        pages: item.pages,
        occurrences: item.occurrences,
        level: item.level.toUpperCase()
      }))
    );

    const practicesBySuccessCriteria = { success: {}, errors: {} };

    simplifiedPracticesData.success.forEach(item => {
      const scs = item.scs;
      if (!scs) return;
      scs.split(',').map(c => c.trim()).forEach(criteria => {
        if (!practicesBySuccessCriteria.success[criteria]) {
          practicesBySuccessCriteria.success[criteria] = [];
        }
        practicesBySuccessCriteria.success[criteria].push({
          practice: t(`ELEMS.${item.practice}`),
          pages: item.pages,
          occurrences: item.occurrences,
          level: item.level.toUpperCase(),
          websiteCount: item.pages
        });
      });
    });

    simplifiedPracticesData.errors.forEach(item => {
      const scs = item.scs;
      if (!scs) return;
      scs.split(',').map(c => c.trim()).forEach(criteria => {
        if (!practicesBySuccessCriteria.errors[criteria]) {
          practicesBySuccessCriteria.errors[criteria] = [];
        }
        practicesBySuccessCriteria.errors[criteria].push({
          practice: t(`ELEMS.${item.practice}`),
          pages: item.pages,
          occurrences: item.occurrences.toString().includes("lang") ? "N/A" : item.occurrences,
          level: item.level.toUpperCase(),
          websiteCount: item.pages
        });
      });
    });

    const sortFormat = (obj) => {
      const formatted = {};
      Object.keys(obj).sort().forEach(k => {
        const arr = obj[k];
        formatted[k] = { criteriaCode: k, practiceCount: arr.length, practices: arr };
      });
      return formatted;
    };

    setSuccessCriteriaSuccess(sortFormat(practicesBySuccessCriteria.success));
    setSuccessCriteriaErrors(sortFormat(practicesBySuccessCriteria.errors));
  };

  // Initial fetch
  useEffect(() => {
    fetchDataWebsites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryName]);

  // -------- Server-side pagination & search ----------
  useEffect(() => {
    const fetchPaginated = async () => {
      try {
        const countRes = await api.get(`/tag/${encodeURIComponent(categoryName)}/user/admin/websites/count/search=${encodeURIComponent(search || '')}`);
        setTotalItems(Number(countRes.data.result || 0));
        const offset = currentPage - 1;
        const listRes = await api.get(`/tag/${encodeURIComponent(categoryName)}/user/admin/websites/all/${itemsPerPage}/${offset}/sort=/direction=/search=${encodeURIComponent(search || '')}`);
        const rows = (listRes.data.result || []).map(w => ({
          id: w.WebsiteId,
          Name: w.Name,
          StartingUrl: w.StartingUrl,
          Pages: w.Pages + "(" + w.Evaluated_Pages + ")",
          Creation_Date: moment(w.Creation_Date).format('DD/MM/YYYY'),
          Declaration:
            w.Declaration === null ? "Não avaliado" :
            w.Declaration === 1 ? "Selo de Ouro" :
            w.Declaration === 2 ? "Selo de Prata" :
            w.Declaration === 3 ? "Selo de Bronze" :
            "Declaração não conforme",
          edit: "Editar",
        }));
        setData(rows);
        setOriginalData(rows);
      } catch (e) {}
    };
    fetchPaginated();
  }, [categoryName, currentPage, itemsPerPage, search]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => { setItemsPerPage(n); setCurrentPage(1); };

  // -------- Actions expected by ContentListWebSites ----------
  const handleOpenReevaluateModal = () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para reavaliar.");
      setShowFeedbackModal(true);
      return;
    }
    setShowModal(true);
  };

  const handleReevaluateWebsites = async () => {
    const websiteIds = checkboxesSelected.map(item => item.id);
    const option = radioValue === "1" ? "all" : "observatory";
    try {
      const response = await api.post('/website/reEvaluate', {
        websitesId: websiteIds,
        option
      });
      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível.");
        setCheckboxesSelected([]);
        setShowModal(false);
        setSearch("");
        await fetchDataWebsites();
      } else {
        setFeedbackMessage("Não foi possível iniciar a reavaliação. Tente novamente.");
      }
    } catch (e) {
      setFeedbackMessage("Erro ao iniciar reavaliação dos sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleOpenCrawlingModal = () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para fazer crawling.");
      setShowFeedbackModal(true);
      return;
    }
    setShowCrawlingModal(true);
  };

  const handleCrawlingWebsites = async ({ maxDepth, maxPages, waitJS, selectedItems }) => {
    const targets = (selectedItems?.length ? selectedItems : checkboxesSelected).map(item => ({
      url: (data.find(d => d.id === item.id) || {}).StartingUrl,
      websiteId: item.id
    })).filter(Boolean);

    if (targets.length === 0) {
      setFeedbackMessage("Seleção inválida. Tente novamente.");
      setShowFeedbackModal(true);
      return;
    }

    try {
      const response = await api.post('/crawler/crawl', {
        websites: targets,
        maxDepth,
        maxPages,
        waitJS: waitJS ? 1 : 0
      });
      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("O crawling foi iniciado com sucesso! O processo será executado em segundo plano.");
        setCheckboxesSelected([]);
        setShowCrawlingModal(false);
      } else {
        setFeedbackMessage("Não foi possível iniciar o crawling. Tente novamente.");
      }
    } catch (e) {
      setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleDeleteWebsites = async () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para eliminar.");
      setShowFeedbackModal(true);
      return;
    }
    const websiteIds = checkboxesSelected.map(item => item.id);
    try {
      const response = await api.post('/website/deleteBulk', { websitesId: websiteIds });
      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("Sítios web eliminados com sucesso!");
        setCheckboxesSelected([]);
        setData(originalData.filter(item => !websiteIds.includes(item.id)));
        setOriginalData(originalData.filter(item => !websiteIds.includes(item.id)));
        await fetchDataWebsites();
      } else {
        setFeedbackMessage("Não foi possível eliminar os sítios web. Tente novamente.");
      }
    } catch (e) {
      setFeedbackMessage("Erro ao eliminar sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleDeletePagesWebsites = async () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para eliminar páginas.");
      setShowFeedbackModal(true);
      return;
    }
    const websiteIds = checkboxesSelected.map(item => item.id);
    try {
      const response = await api.post('/website/pages/deleteBulk', { websitesId: websiteIds });
      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("Páginas dos sítios web eliminadas com sucesso!");
        setCheckboxesSelected([]);
        setSearch("");
        await fetchDataWebsites();
      } else {
        setFeedbackMessage("Não foi possível eliminar as páginas. Tente novamente.");
      }
    } catch (e) {
      setFeedbackMessage("Erro ao eliminar páginas dos sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const barOptionsCopy = JSON.parse(JSON.stringify(barOptions || {}));
  const handleExportCSV = async () => {
    try {
      downloadCSV(
        data.map((w) => ({WebsiteId: w.id, Name: w.Name})),
        "Categoria"
      );
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  }
  return (
    <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
      <div className="flex justify-between items-center mb-4">
        <Breadcrumb
          darkTheme={theme}
          data={breadcrumbs}
          tagHere={t('BREADCRUMB.tag_here')}
        />
      </div>

      <div>
        <h1>Dados Globais da Categoria</h1>

        <div className="mt-5">
          <ContentListWebSites
            title={`Lista de sítios web da categoria "${categoryName}"`}
            darkTheme={theme}
            checkboxesSelected={checkboxesSelected}
            setCheckboxesSelected={setCheckboxesSelected}
            data={data}
            setData={setData}
            search={search}
            handleSearchChange={(e) => setSearch(e.target.value)}
            onDeleteWebsites={handleDeleteWebsites}
            onDeletePagesWebsites={handleDeletePagesWebsites}
            onReevaluateWebsites={handleOpenReevaluateModal}
            onCrawlWebsites={handleOpenCrawlingModal}
            setItemsPerPage={setItemsPerPage}
            navigate={navigate}
          />
        </div>

        <div className="bg-white mt-5">
          <div>
            <h2>Exportação de dados</h2>
            <p>Para exportar todos os dados da Categoria "{categoryName}" à data de hoje, pressione o botão "Exportar CSV" abaixo.</p>
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

        <div className="mt-5 bg-white">
          <h2 className="mb-4">Indicadores globais da Categoria</h2>
          <Indicators listItems={listItems}/>
        </div>

        <div className="mt-5 bg-white p-4">
          <h2 className="mb-4">Conformidade global da Categoria</h2>
          <Indicators listItems={listItemsGlobal}/>
        </div>

        <div className="mt-5 bg-white p-4">
          <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo da Categoria</h2>
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
          <RadarGraph websites={radarWebsites} labelDataSet="Pontuação por sítio Web" darkTheme={theme} showTabs={true} />
        </div>

        <div className="mt-5 bg-white p-4">
          <h2 className="mb-4">Distribuição detalhada das melhores práticas</h2>
          <SortingTable
            hasSort={false}
            headers={detailsTableHeaders || []}
            dataList={dataListDetails.filter(item => !item.occurrences.toString().includes("lang"))}
            columnsOptions={columnsOptionsDetails || {}}
            darkTheme={theme}
            pagination={true}
            links={false}
            ariaLabels={ariaLabels || {}}
            caption="Distribuição detalhada das melhores práticas"
            setDataList={() => {}}
            nextPage={() => {}}
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[
              "Ver",           // see
              "por página",    // per_page
              "Selector de itens por página", // selectorAria
              "Navegação do seletor de itens por página" // selectorNav
            ]}
            iconsAltTexts={[]}
            paginationButtonsTexts={[
              "Primeira página",
              "Página anterior",
              "Página seguinte",
              "Última página"
            ]}
            project=""
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            paginationOptions={[
                50,
                60,
                70,
                80,
                90,
                100,            
     
            ]}
            setCheckboxesSelected={() => {}}
          />
        </div>

        <div className="mt-5 bg-white p-4">
          <h2 className="mb-4">Distribuição detalhada das piores práticas</h2>
          <SortingTable
            hasSort={false}
            headers={detailsTableHeaders || []}
            dataList={dataListDetailsBad.filter(item => !item.occurrences.toString().includes("lang"))}
            columnsOptions={columnsOptionsDetails || {}}
            darkTheme={theme}
            pagination={false}
            links={false}
            ariaLabels={ariaLabels || {}}
            caption="Distribuição detalhada das piores práticas"
            setDataList={() => {}}
            nextPage={() => {}}
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[]}
            iconsAltTexts={[]}
            paginationButtonsTexts={[]}
            project=""
            setCheckboxesSelected={() => {}}
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
        </div>
      </div>

      {/* Modal: Reavaliar */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        title={t('WEBSITES_PAGE.LIST.re_evaluate_websites')}
      >
        <p>Escolha que páginas quer reavaliar</p>
        <RadioGroup
          darkTheme={theme}
          data={[
            { id: '1', name: "Todas as páginas" },
            { id: '2', name: "Apenas as páginas do observatório" }
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

      {/* Modal: Feedback */}
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

      {/* Modal: Crawling */}
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
const ViewCategories = memo(ViewCategoriesComponent);

export default ViewCategories;
