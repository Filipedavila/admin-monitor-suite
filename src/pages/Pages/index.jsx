import { useState, useEffect, useCallback, useMemo } from "react";
import { sortFields } from "./table.config.jsx";
import { useServerSort } from "../../hooks/useServerSort";
import qs from "qs";
import "./style.users.css";
import { Link, useNavigate } from "react-router-dom";
import ContentListPages from "./components/ContentListPage";
import { Breadcrumb, Button } from "@a12e/accessmonitor-ds";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import { deletePages, getDeletePagesErrorKey, getObservatoryFeedback, isPageInObservatory, togglePagesObservatory } from "../../services/pages";
import { Modal } from "../../components/Modal";
import { useTheme } from '../../context/ThemeContext';
import { setWebsiteNavigationContext } from "../../utils/navigation";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";
import { usePermissions } from "../../context/AuthContext";
import moment from "moment";
import { calculateTotalElements } from "../../utils/utils";
import { useEvaluationState } from "../../utils/evaluationEvents";
import { evaluationStatusHtml } from "../../components/EvaluationStatus";



const PageList = () => {
  const { t } = useTranslation();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange } = useServerSort(sortFields, () => setCurrentPage(1));
  const [search, setSearch] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    {
      title: "Páginas",
    },
  ];

  // Clear website context when viewing pages list directly
  useEffect(() => {
    setWebsiteNavigationContext(null);
  }, []);

  const handleSearchChange = (e) => {
    const value = typeof e === 'string' ? e : (e?.target?.value ?? "");
    setSearch(value);
    setCurrentPage(1);
  };

  // Live evaluation state (SSE): circle with progress per page, and refresh when one completes.
  const { pages: livePages, completedTick } = useEvaluationState();
  const rows = useMemo(
    () => data.map((row) => ({ ...row, EvaluationStatus: evaluationStatusHtml(livePages.get(row.id), row.Evaluated) })),
    [data, livePages]
  );

  const fetchData = useCallback(async (page, limit, search) => {
    setCheckboxesSelected([]);
    try {
      const queryObj = { pagination: { limit, page } };
      if (search) queryObj.filters = { searchTerm: search };
      if (sorts) queryObj.sorts = sorts;
      const query = qs.stringify(queryObj);
      const response = await api.get(`/pages?${query}`);
      const { data, pagination } = response.data;
      setData(
        data.map((item) => {
          const evaluation = item.evaluation;
          const elementCount = typeof evaluation?.tagCount === "object"
            ? calculateTotalElements(evaluation.tagCount)
            : Number(evaluation?.tagCount) || 0;

          return {
            id: item.id,
            WebsiteId: item.websiteId ?? item.website?.id,
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
    } catch {
      setFeedbackMessage("Erro ao carregar páginas!");
      setShowFeedbackModal(true);
    }
  }, [sorts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(currentPage, itemsPerPage, search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, itemsPerPage, search, fetchData]);

  useEffect(() => {
    if (!completedTick) return undefined;
    const timeout = setTimeout(() => fetchData(currentPage, itemsPerPage, search), 1500);
    return () => clearTimeout(timeout);
  }, [completedTick]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1); // Reset to first page
  };
  
  const handleDeletePages = () => {
    if (!canDelete) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage(t("PAGES_PAGE.DELETE.none_selected"));
      setShowFeedbackModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmDeletePages = async () => {
    if (!canDelete) return;
    const pagesId = checkboxesSelected.map(item => item.id);
    try {
      await deletePages(pagesId);
      setFeedbackMessage(t("PAGES_PAGE.DELETE.success", { count: pagesId.length }));
      setCheckboxesSelected([]);
      await fetchData(currentPage, itemsPerPage, search);
    } catch (error) {
      setFeedbackMessage(t(getDeletePagesErrorKey(error)));
    }
    setShowConfirmModal(false);
    setShowFeedbackModal(true);
  };

  const handleReevaluatePages = async () => {
    if (!canEdit) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos uma página para reavaliar.");
      setShowFeedbackModal(true);
      return;
    }
    const pagesId = checkboxesSelected.map(item => item.id);
    try {
      await api.post('/evaluations', {
        triggerType: "PAGE",
        targetIds: pagesId,
      });
      setFeedbackMessage("As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível.");
      setCheckboxesSelected([]);
      await fetchData(currentPage, itemsPerPage, search);
    } catch {
      setFeedbackMessage("Erro ao iniciar reavaliação das páginas. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleShowHideObservatory = async () => {
    if (!canEdit) return;
    const summary = await togglePagesObservatory(checkboxesSelected.map(item => ({
      id: item.id,
      websiteId: item.WebsiteId,
      inObservatory: item.OPAW === "Sim",
    })));

    setFeedbackMessage(getObservatoryFeedback(summary));
    setCheckboxesSelected([]);
    await fetchData(currentPage, itemsPerPage, search);
    setShowFeedbackModal(true);
  };
  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t('PAGES_PAGE.LIST.title')}</h1>
      <p>
        {t('PAGES_PAGE.LIST.subtitle')} num total de {totalItems} páginas.
      </p>
      <div className="content bg-white">
        {canCreate && (
        <div className="d-flex gap-2 mb-3">
          <Button
            darkTheme={theme}
            text="Criar página"
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => navigate("/dashboard/pages/create")}
          />
        </div>
        )}
        <h2>{t('PAGES_PAGE.LIST.title')}</h2>
        <ContentListPages
          onSortChange={onSortChange}
          checkboxesSelected={checkboxesSelected}
          setCheckboxesSelected={setCheckboxesSelected}
          data={rows}
          setData={setData}
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
      <Modal
        isOpen={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
        title="Eliminar Páginas"
      >
        <p>Tem a certeza que pretende eliminar {checkboxesSelected.length} página(s) selecionada(s)?</p>
        <div className="d-flex gap-2">
          <Button darkTheme={theme} text="Confirmar" className="btn-primary" onClick={confirmDeletePages} />
          <Button darkTheme={theme} text="Cancelar" variant="danger" onClick={() => setShowConfirmModal(false)} />
        </div>
      </Modal>
      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title="Páginas"
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
  );
};

export default PageList;
