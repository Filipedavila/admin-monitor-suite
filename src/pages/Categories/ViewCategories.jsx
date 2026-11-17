import { useState, useEffect, useMemo, memo } from "react";
import { sortFields } from "../Websites/table.config.jsx";
import { useServerSort } from "../../hooks/useServerSort";
import qs from "qs";
import { useNavigate, Link, useLocation, useParams } from "react-router-dom";
import { Button, Breadcrumb, SortingTable, Tabs } from "@a12e/accessmonitor-ds";
import { Bar } from "react-chartjs-2";
import { ScoreDistributionRadar } from "../../components/ScoreDistributionRadar";
import { useTheme } from "../../context/ThemeContext";
import ContentListWebSites from "../Websites/components/ContentListWebSites";
import { barOptionsDark } from "../Websites/table.config.jsx";
import {
  barData,
  barOptions,
} from "../../components/BarLineGraph/table.config.jsx";
import Indicators from "../../components/Indicators";
import { detailsTableHeaders, columnsOptionsDetails, ariaLabels } from "./table.config.jsx";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import { buildScopedAnalyticsView } from "../../utils/utils.js";
import { downloadAnalyticsExport } from "../../services/analytics.js";
import { Modal } from "../../components/Modal";
import CrawlingModal from "../../components/CrawlingModal";
import { setRootNavigationContext } from "../../utils/navigation";
import { usePermissions } from "../../context/AuthContext";
import { deleteWebsites, getDeleteWebsitesErrorKey } from "../../services/websites";
import { evaluateWebsites, getEvaluationFeedback } from "../../services/evaluations";
import { crawlTag, crawlWebsites, getCrawlTagsFeedback } from "../../services/discovery";

const ViewCategoriesComponent = () => {
  const { t } = useTranslation();
  const { categoryName } = useParams();
  const { theme } = useTheme();
  const { canEdit, canDelete } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  // Breadcrumbs
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  // List & search — same server-side listing logic as the Websites page
  // (src/pages/Websites/index.jsx), scoped to this category via filters[tagId]
  // ("categories" are the "tags" resource on the backend).
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [tagId, setTagId] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange } = useServerSort(sortFields, () => setCurrentPage(1));
  const [websitesVersion, setWebsitesVersion] = useState(0);

  // Charts & indicators
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
  const [showModal, setShowModal] = useState(false); // Re-evaluate
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCrawlingModal, setShowCrawlingModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackRole, setFeedbackRole] = useState(null);
  const [isCrawlingTag, setIsCrawlingTag] = useState(false);
  const [, setIsLoadingWebsites] = useState(true);
  const [isProcessingStats, setIsProcessingStats] = useState(true);
  const [, setWebsitesError] = useState(null);
  const [, setHasInitialLoad] = useState(false);
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

  // The route only carries the category name, so the tag id used by
  // /websites?filters[tagId] must be resolved first via the tags list endpoint.
  const resolveTagId = async () => {
    const query = qs.stringify({ filters: { searchTerm: categoryName }, pagination: { limit: 20, page: 1 } });
    const response = await api.get(`/tags?${query}`);
    const match = (response.data?.data || []).find(item => item.name === categoryName);
    return match?.id ?? null;
  };

  // Same endpoint/query shape as the Websites page (src/pages/Websites/index.jsx),
  // scoped to this category via filters[tagId] — server-side pagination + search.
  const fetchWebsitesPage = async (id, page, limit, searchTerm) => {
    const queryObj = {
      pagination: { limit, page },
      filters: { tagId: id },
    };
    if (searchTerm) queryObj.filters.searchTerm = searchTerm;
    if (sorts) queryObj.sorts = sorts;
    const query = qs.stringify(queryObj);
    const response = await api.get(`/websites?${query}`);
    const { data: items, pagination } = response.data;
    const mapped = (items || []).map(item => ({
      id: item.id,
      Title: item.title,
      BaseUrl: item.baseUrl,
      Creation_Date: new Date(item.createdAt),
      edit: "Editar",
    }));
    return { mapped, totalItems: pagination?.totalItems ?? mapped.length };
  };

  // -------- Fetch metrics/indicators (reutilizável após ações) ----------
  const fetchDataWebsites = async (id = tagId) => {
    if (!id) return;
    const response = await api.get(`/analytics/tag/${id}`);
    const view = buildScopedAnalyticsView(response.data.data.ams, t);

    setDataListBar(view.dataListBar);
    setBarDataDynamic({
          ...barData,
          datasets: [
            {
              type: 'bar',
              label: "Frequência (nº de páginas)",
              data: view.scoreDistribution,
              backgroundColor: '#339',
              categoryPercentage: 1,
              barPercentage: 1,
              grouped: true,
            }
          ]
        });
    setListItems(view.listItems);
    setListItemsGlobal(view.listItemsGlobal);
    setDataListDetails(view.details);
    setDataListDetailsBad(view.detailsBad);
    setSuccessCriteriaSuccess(view.successCriteriaSuccess);
    setSuccessCriteriaErrors(view.successCriteriaErrors);
  };

  // Resolve the tag (category) id whenever the route param changes, and reset table paging.
  useEffect(() => {
    let isCancelled = false;
    const resolve = async () => {
      setIsLoadingWebsites(true);
      setWebsitesError(null);
      setCurrentPage(1);
      setSearch("");
      try {
        const id = await resolveTagId();
        if (isCancelled) return;
        setTagId(id);
        if (!id) {
          setData([]);
          setTotalItems(0);
          setIsLoadingWebsites(false);
          setIsProcessingStats(false);
          setHasInitialLoad(true);
        }
      } catch (error) {
        console.error("Error resolving category:", error);
        setWebsitesError('Erro ao carregar dados da categoria');
        setIsLoadingWebsites(false);
      }
    };
    resolve();
    return () => {
      isCancelled = true;
    };
  }, [categoryName]);

  // Fetch the (paginated/searched) website list for the table — mirrors the debounced
  // fetch in Websites/index.jsx — whenever the tag, paging, search or a mutation
  // (via websitesVersion) changes.
  useEffect(() => {
    if (!tagId) return;
    let isCancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const { mapped, totalItems: total } = await fetchWebsitesPage(tagId, currentPage, itemsPerPage, search);
        if (isCancelled) return;
        setData(mapped);
        setTotalItems(total);
        setIsLoadingWebsites(false);
      } catch (error) {
        console.error("Error fetching category websites:", error);
        setWebsitesError('Erro ao carregar sítios web da categoria');
        setIsLoadingWebsites(false);
      }
    }, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [tagId, currentPage, itemsPerPage, search, websitesVersion, sorts]);

  // Load category-wide metrics from /analytics/tag/{tagId} — independent of the
  // table's pagination/search.
  useEffect(() => {
    if (!tagId) return;
    let isCancelled = false;
    const loadMetrics = async () => {
      setIsProcessingStats(true);
      try {
        await fetchDataWebsites(tagId);
      } catch (error) {
        console.error("Error loading category metrics:", error);
      } finally {
        if (!isCancelled) {
          setIsProcessingStats(false);
          setHasInitialLoad(true);
        }
      }
    };
    loadMetrics();
    return () => {
      isCancelled = true;
    };
  }, [tagId]);

  // -------- Actions expected by ContentListWebSites ----------
  const handleOpenReevaluateModal = () => {
    if (!canEdit) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para reavaliar.");
      setShowFeedbackModal(true);
      return;
    }
    setShowModal(true);
  };

  const handleReevaluateWebsites = async () => {
    if (!canEdit) return;
    try {
      const result = await evaluateWebsites(checkboxesSelected.map(item => item.id));
      const { key, params } = getEvaluationFeedback(result);
      setFeedbackMessage(t(key, params));
      if (result.succeeded.length > 0) {
        setCheckboxesSelected([]);
        setShowModal(false);
        setSearch("");
        setWebsitesVersion(v => v + 1);
        await fetchDataWebsites();
      }
    } catch {
      setFeedbackMessage(t("EVALUATIONS.error"));
    }
    setShowFeedbackModal(true);
  };

  const handleOpenCrawlingModal = () => {
    if (!canEdit) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para fazer crawling.");
      setShowFeedbackModal(true);
      return;
    }
    setShowCrawlingModal(true);
  };

  const handleCrawlingWebsites = async ({ selectedItems }) => {
    if (!canEdit) return;
    const items = selectedItems?.length ? selectedItems : checkboxesSelected;
    const websites_ids = items.map(item => item.id);

    if (websites_ids.length === 0) {
      setFeedbackMessage("Seleção inválida. Tente novamente.");
      setShowFeedbackModal(true);
      return;
    }

    try {
      // v5 "Discovery > Crawl Website": POST /discovery { websitesId }. POST /discovery/:id é o crawl
      // por categoria e recebe o id da tag, não o do sítio web.
      const response = await crawlWebsites(websites_ids);
      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("O crawling foi iniciado com sucesso! O processo será executado em segundo plano.");
        setCheckboxesSelected([]);
        setShowCrawlingModal(false);
      } else {
        setFeedbackMessage("Não foi possível iniciar o crawling. Tente novamente.");
      }
    } catch {
      setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  // Crawl da categoria inteira (v5 "Discovery > Crawl Website Tags"): POST /discovery/:tagId.
  const handleCrawlTag = async () => {
    if (!canEdit || !tagId || isCrawlingTag) return;
    setIsCrawlingTag(true);
    try {
      await crawlTag(tagId);
      setFeedbackMessage(t("CRAWL_TAGS.started", { count: 1 }));
      setFeedbackRole("status");
    } catch (error) {
      const result = { total: 1, succeeded: [], failed: [{ id: tagId, error }] };
      setFeedbackMessage(t(getCrawlTagsFeedback(result).key));
      setFeedbackRole("alert");
    } finally {
      setIsCrawlingTag(false);
    }
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackRole(null);
  };

  const handleDeleteWebsites = async () => {
    if (!canDelete) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage(t("WEBSITES_DELETE.none_selected"));
      setShowFeedbackModal(true);
      return;
    }
    const websiteIds = checkboxesSelected.map(item => item.id);
    try {
      await deleteWebsites(websiteIds);
      setFeedbackMessage(t("WEBSITES_DELETE.success", { count: websiteIds.length }));
      setCheckboxesSelected([]);
      setSearch("");
      setCurrentPage(1);
      setWebsitesVersion(v => v + 1);
      await fetchDataWebsites();
    } catch (error) {
      setFeedbackMessage(t(getDeleteWebsitesErrorKey(error)));
    }
    setShowFeedbackModal(true);
  };

  const handleDeletePagesWebsites = async () => {
    if (!canDelete) return;
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
        setWebsitesVersion(v => v + 1);
        await fetchDataWebsites();
      } else {
        setFeedbackMessage("Não foi possível eliminar as páginas. Tente novamente.");
      }
    } catch {
      setFeedbackMessage("Erro ao eliminar páginas dos sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const barOptionsCopy = JSON.parse(JSON.stringify(barOptions || {}));

  const handleExportCSV = async () => {
    try {
      await downloadAnalyticsExport({ resource: "tag", format: "csv", context: "ams", entityId: tagId });
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
        <h1 id="lista-sitios-web" tabIndex={-1}>Dados Globais da Categoria</h1>

        <div className="mt-5">
          <ContentListWebSites
            onSortChange={onSortChange}
            title={`Lista de sítios web da categoria "${categoryName}"`}
            darkTheme={theme}
            checkboxesSelected={checkboxesSelected}
            setCheckboxesSelected={setCheckboxesSelected}
            data={data}
            setData={setData}
            totalItems={totalItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            onPageChange={(page) => setCurrentPage(page)}
            onItemsPerPageChange={(n) => { setItemsPerPage(n); setCurrentPage(1); }}
            setItemsPerPage={setItemsPerPage}
            search={search}
            handleSearchChange={(e) => {
              const value = typeof e === 'string' ? e : (e?.target?.value ?? "");
              setSearch(value);
              setCurrentPage(1);
            }}
            onDeleteWebsites={handleDeleteWebsites}
            onDeletePagesWebsites={handleDeletePagesWebsites}
            onReevaluateWebsites={handleOpenReevaluateModal}
            onCrawlWebsites={handleOpenCrawlingModal}
            serverSidePagination={true}
            navigate={navigate}
            origin={{ type: "category", name: categoryName }}
          />
        </div>

        <div className="bg-white mt-5">
          <div>
            <h2>Exportação de dados</h2>
            <p>Para exportar todos os dados da Categoria &quot;{categoryName}&quot; à data de hoje, pressione o botão &quot;Exportar CSV&quot; abaixo.</p>
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
          {isProcessingStats ? (
            <p className="text-muted">A calcular indicadores...</p>
          ) : (
            <Indicators listItems={listItems}/>
          )}
        </div>

        <div className="mt-5 bg-white p-4">
          <h2 className="mb-4">Conformidade global da Categoria</h2>
          {isProcessingStats ? (
            <p className="text-muted">A calcular conformidade...</p>
          ) : (
            <Indicators listItems={listItemsGlobal}/>
          )}
        </div>

        <div className="mt-5 bg-white p-4">
          <h2 className="mb-4">Distribuição das pontuações AccessMonitor no universo da Categoria</h2>
          {isProcessingStats ? (
            <p className="text-muted">A preparar distribuição...</p>
          ) : (
            <Tabs
              defaultActiveKey="chart"
              darkTheme={theme}
              tabs={[
                {
                  eventKey: "chart",
                  title: "Gráfico",
                  component: (
                    <Bar
                      role="img"
                      aria-label="Histograma das pontuações do AccessMonitor"
                      data={barDataDynamic}
                      options={theme === "light" ? barOptionsCopy : barOptionsDark}
                    />
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
                      caption="Distribuição das pontuações AccessMonitor no universo da Categoria"
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
          )}
        </div>

        <div className="mt-5 bg-white p-4">
          <h2 className="mb-4">Mancha Gráfica da Acessibilidade</h2>
          <Button
            darkTheme={theme}
            text="Ir para a lista de sítios web da categoria"
            className="btn-primary mb-4"
            onClick={() => {
              const el = document.getElementById("lista-sitios-web");
              el?.scrollIntoView({ behavior: "smooth", block: "start" });
              el?.focus({ preventScroll: true });
            }}
          />
        {isProcessingStats ? (
          <p className="text-muted">A preparar gráfico radar...</p>
        ) : (
          <ScoreDistributionRadar dataListBar={dataListBar} theme={theme} caption="Mancha gráfica da acessibilidade — número de páginas por nota das páginas da categoria" />
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
      </div>

      {/* Modal: Reavaliar */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        title={t('WEBSITES_PAGE.LIST.re_evaluate_websites')}
      >
        <p>Tem a certeza que pretende reavaliar os sítios web selecionados?</p>
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
        onRequestClose={closeFeedbackModal}
        title="Sítios Web"
      >
        <p role={feedbackRole || undefined}>{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text="OK"
          className="btn-primary"
          onClick={closeFeedbackModal}
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
