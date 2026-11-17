import { useState, useEffect, useMemo, memo } from "react";
import { sortFields } from "../Websites/table.config.jsx";
import { useServerSort } from "../../hooks/useServerSort";
import qs from "qs";
import { Button, Breadcrumb, SortingTable, Tabs } from "@a12e/accessmonitor-ds";
import "./style.users.css";
import { Bar } from "react-chartjs-2";
import { ScoreDistributionRadar } from "../../components/ScoreDistributionRadar";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import {
  barData,
  barOptions,
} from "../../components/BarLineGraph/table.config.jsx";
import { columnsOptionsDetails, detailsTableHeaders, ariaLabels } from "../Directories/table.config.jsx";
import { useTheme } from "../../context/ThemeContext.jsx";
import ContentListWebSites from "../Websites/components/ContentListWebSites.jsx";
import { barOptionsDark } from "../Websites/table.config.jsx";
import { useTranslation } from "react-i18next";
import Indicators from "../../components/Indicators";
import { api } from "../../config/api";
import { buildScopedAnalyticsView } from "../../utils/utils.js";
import { downloadAnalyticsExport } from "../../services/analytics.js";
import { Modal } from "../../components/Modal";
import { setRootNavigationContext } from "../../utils/navigation";
import { usePermissions } from "../../context/AuthContext";
import { deleteWebsites, getDeleteWebsitesErrorKey } from "../../services/websites";
import { evaluateWebsites, getEvaluationFeedback } from "../../services/evaluations";

const ViewEntitiesComponent = () => {
  const location = useLocation();
  const { entityName } = useParams();
  const { theme } = useTheme();
  const { canEdit, canDelete } = usePermissions();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [barDataDynamic, setBarDataDynamic] = useState(barData);
  const [dataListBar, setDataListBar] = useState([]);
  // Memoize initial empty states
  const initialSuccessCriteria = useMemo(() => ({}), []);
  const [listItems, setListItems] = useState([]);
  const [listItemsGlobal, setListItemsGlobal] = useState([]);
  const [dataListDetails, setDataListDetails] = useState([]);
  const [dataListDetailsBad, setDataListDetailsBad] = useState([]);
  const [successCriteriaSuccess, setSuccessCriteriaSuccess] = useState(initialSuccessCriteria);
  const [successCriteriaErrors, setSuccessCriteriaErrors] = useState(initialSuccessCriteria);
  const barOptionsCopy = JSON.parse(JSON.stringify(barOptions || {}));

  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [, setShowCrawlingModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [search, setSearch] = useState("");
  const [institutionId, setInstitutionId] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange } = useServerSort(sortFields, () => setCurrentPage(1));
  const [websitesVersion, setWebsitesVersion] = useState(0);
  const [, setIsLoadingWebsites] = useState(true);
  const [isProcessingStats, setIsProcessingStats] = useState(true);
  const [, setWebsitesError] = useState(null);
  const [, setHasInitialLoad] = useState(false);


  const resolveEntityId = async () => {
    const query = qs.stringify({ filters: { searchTerm: entityName }, pagination: { limit: 20, page: 1 } });
    const response = await api.get(`/institutions/?${query}`);
    const match = (response.data?.data || []).find(item => item.longName === entityName);
    return match?.id ?? null;
  };


  // Same endpoint/query shape as the Websites page (src/pages/Websites/index.jsx),
  // scoped to this entity via filters[institutionId] — server-side pagination + search.
  const fetchWebsitesPage = async (id, page, limit, searchTerm) => {
    const queryObj = {
      pagination: { limit, page },
      filters: { institutionId: id },
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
    const resolve = async () => {
      setIsLoadingWebsites(true);
      setWebsitesError(null);
      setCurrentPage(1);
      setSearch("");
      try {
        const id = await resolveEntityId();
        if (isCancelled) return;
        setInstitutionId(id);
        if (!id) {
          setData([]);
          setTotalItems(0);
          setIsLoadingWebsites(false);
        }
      } catch (error) {
        console.error("Error resolving entity:", error);
        setWebsitesError('Erro ao carregar dados da entidade');
        setIsLoadingWebsites(false);
      }
    };
    resolve();
    return () => {
      isCancelled = true;
    };
  }, [entityName]);

  // Fetch the (paginated/searched) website list for the table — mirrors the debounced
  // fetch in Websites/index.jsx — whenever the entity, paging, search or a mutation
  // (via websitesVersion) changes.
  useEffect(() => {
    if (!institutionId) return;
    let isCancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const { mapped, totalItems: total } = await fetchWebsitesPage(institutionId, currentPage, itemsPerPage, search);
        if (isCancelled) return;
        setData(mapped);
        setTotalItems(total);
        setIsLoadingWebsites(false);
      } catch (error) {
        console.error("Error fetching entity websites:", error);
        setWebsitesError('Erro ao carregar sítios web da entidade');
        setIsLoadingWebsites(false);
      }
    }, 300);
    return () => {
      isCancelled = true;
      clearTimeout(timeout);
    };
  }, [institutionId, currentPage, itemsPerPage, search, websitesVersion, sorts]);

  // Load entity-wide metrics from /analytics/institution/{id} once the institution id
  // is resolved — independent of the table's pagination/search.
  useEffect(() => {
    if (!institutionId) {
      setHasInitialLoad(true);
      return;
    }
    let isCancelled = false;

    const fetchData = async () => {
      try {
        setHasInitialLoad(false);
        setIsProcessingStats(true);

        const response = await api.get(`/analytics/institution/${institutionId}`);
        if (isCancelled) return;
        const view = buildScopedAnalyticsView(response.data.data.ams, t, { dateFormat: 'D [de] MMMM [de] YYYY' });

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
      setIsProcessingStats(false);
      setHasInitialLoad(true);
      } catch (error) {
        console.error("Error loading entity metrics:", error);
        setWebsitesError('Erro ao carregar dados da entidade');
        setIsProcessingStats(false);
        setHasInitialLoad(true); // Mark as complete even on error
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [institutionId, t]);
  const handleCrawlingWebsites = async (selectedItems) => {
    if (!canEdit) return;
    if (selectedItems.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para fazer crawling.");
    //  setShowFeedbackModal(true);
      return;
    }

    const websites_ids = selectedItems.map(item => item.id);

    try {
      const responses = await api.post(`/discovery`, {
        websitesId: websites_ids
      })
      if (responses.status === 201 || responses.status === 200) {
        setFeedbackMessage("O crawling foi iniciado com sucesso! O processo será executado em segundo plano.");
        setCheckboxesSelected([]);
        setShowCrawlingModal(false);

      } else {
        setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
      }
    } catch {
      setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  // Handle delete websites
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
    } catch (error) {
      setFeedbackMessage(t(getDeleteWebsitesErrorKey(error)));
    }
    setShowFeedbackModal(true);
  };

  // Handle delete pages
  const handleDeletePagesWebsites = async () => {
    if (!canDelete) return;
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
        setWebsitesVersion(v => v + 1);
      }
    } catch {
      setFeedbackMessage("Erro ao eliminar páginas dos sítios web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  // Handle re-evaluate websites
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
      }
    } catch {
      setFeedbackMessage(t("EVALUATIONS.error"));
    }
    setShowFeedbackModal(true);
  };

  const handleExportCSV = async () => {
    try {
      await downloadAnalyticsExport({ resource: "institution", format: "csv", context: "ams", entityId: institutionId });
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  }
  return (
    <div>
      <Breadcrumb data={breadcrumbs || []} />
      <h1 id="lista-sitios-web" tabIndex={-1}>{t('ENTITIES_PAGE.LIST.title', { entityName })}</h1>


      <ContentListWebSites
        onSortChange={onSortChange}
        title={t('WEBSITES_PAGE.LIST.subtitle_list', { entityName })}
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
        handleSearchChange={e => {
          const value = typeof e === 'string' ? e : (e?.target?.value ?? "");
          setSearch(value);
          setCurrentPage(1);
        }}
        onDeleteWebsites={handleDeleteWebsites}
        onDeletePagesWebsites={handleDeletePagesWebsites}
        onReevaluateWebsites={handleReevaluateWebsites}
        onCrawlWebsites={handleCrawlingWebsites}
        navigate={navigate}
        origin={{ type: "entity", name: entityName }}
        serverSidePagination={true}
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
                    caption="Distribuição das pontuações AccessMonitor no universo da Entidade"
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
          text="Ir para a lista de sítios web da entidade"
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
          <ScoreDistributionRadar dataListBar={dataListBar} theme={theme} caption="Mancha gráfica da acessibilidade — número de páginas por nota das páginas da entidade" />
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
        <p>Tem a certeza que pretende reavaliar os sítios web selecionados?</p>
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

    </div>
  )
}

// Export memoized component to prevent unnecessary re-renders
const ViewEntities = memo(ViewEntitiesComponent);

export default ViewEntities;