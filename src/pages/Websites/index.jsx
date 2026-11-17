import { useState, useEffect, useCallback } from "react";
import { sortFields } from "./table.config.jsx";
import { useServerSort } from "../../hooks/useServerSort";
import qs from "qs";
import { Button, Breadcrumb } from "@a12e/accessmonitor-ds";
import "./style.users.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ContentListWebSites from "./components/ContentListWebSites.jsx";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import { useTheme } from "../../context/ThemeContext";
import { setRootNavigationContext, setWebsiteNavigationContext } from "../../utils/navigation";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";
import { usePermissions } from "../../context/AuthContext";
import { deleteWebsites, getDeleteWebsitesErrorKey } from "../../services/websites";
import { evaluateWebsites, getEvaluationFeedback } from "../../services/evaluations";

const WebSiteList = () => {
  const { t } = useTranslation();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const { theme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange } = useServerSort(sortFields, () => setCurrentPage(1));
  const [search, setSearch] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [, setShowCrawlingModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    {
      title: "Sítios Web",
    },
  ];

  useEffect(() => {
    // Clear root context and website context when viewing website list
    setRootNavigationContext(null);
    setWebsiteNavigationContext(null);
  }, []);

  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem("currentPath");
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem("previousPath", lastPath);
    }
    localStorage.setItem("currentPath", currentPath);
  }, [location.pathname]);

  const handleSearchChange = (e) => {
    const value = typeof e === 'string' ? e : (e?.target?.value ?? "");
    setSearch(value);
    setCurrentPage(1);
  };

  const fetchData = useCallback(async (page, limit, search) => {
    const queryObj = { pagination: { limit, page } };
    if (search) queryObj.filters = { searchTerm: search };
    if (sorts) queryObj.sorts = sorts;
    const query = qs.stringify(queryObj);
    const response = await api.get(`/websites?${query}`);
    const { data, pagination } = response.data;
    setData(
      data.map((item) => ({
        id: item.id,
        Title: item.title,
        BaseUrl: item.baseUrl,
        Creation_Date: new Date(item.createdAt),
        edit: "Editar",
      }))
    );
    setTotalItems(pagination.totalItems);
  }, [sorts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(currentPage, itemsPerPage, search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, itemsPerPage, search, fetchData]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleCrawlingWebsites = async (selectedItems) => {
    if (selectedItems.length === 0) {
      setFeedbackMessage(
        "Por favor, selecione pelo menos um sítio web para fazer crawling."
      );
      setShowFeedbackModal(true);
      return;
    }

    const websitesId = selectedItems.map(item => item.id);

    try {
      const responses = await api.post(`/discovery`, {
        websitesId
      });

      if (responses.status === 201 || responses.status === 200) {
        setFeedbackMessage("O crawling foi iniciado com sucesso! O processo será executado em segundo plano.");
        setCheckboxesSelected([]);
        setShowCrawlingModal(false);
        await fetchData(1, itemsPerPage, "");
      }
    } catch {
      setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleDeleteWebsites = () => {
    if (!canDelete) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um sítio web para eliminar.");
      setShowFeedbackModal(true);
      return;
    }
    setShowConfirmDeleteModal(true);
  };

  const confirmDeleteWebsites = async () => {
    if (!canDelete) return;
    const websiteIds = checkboxesSelected.map((item) => item.id);
    try {
      await deleteWebsites(websiteIds);
      setFeedbackMessage(t("WEBSITES_DELETE.success", { count: websiteIds.length }));
      setCheckboxesSelected([]);
      await fetchData(currentPage, itemsPerPage, search);
    } catch (error) {
      setFeedbackMessage(t(getDeleteWebsitesErrorKey(error)));
    }
    setShowConfirmDeleteModal(false);
    setShowFeedbackModal(true);
  };

  // Handle delete pages
  const handleDeletePagesWebsites = async () => {
    if (!canDelete) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage(
        "Por favor, selecione pelo menos um sítio web para eliminar páginas."
      );
      setShowFeedbackModal(true);
      return;
    }
    const websiteIds = checkboxesSelected.map((item) => item.id);
    try {
      const response = await api.post("/website/pages/deleteBulk", {
        websitesId: websiteIds,
      });

      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("Páginas dos sítios web eliminadas com sucesso!");
        setCheckboxesSelected([]);
        setSearch("");
        await fetchData(1, itemsPerPage, "");
      }
    } catch {
      setFeedbackMessage(
        "Erro ao eliminar páginas dos sítios web. Tente novamente."
      );
    }
    setShowFeedbackModal(true);
  };

  // Handle re-evaluate websites
  const handleReevaluateWebsites = async () => {
    if (!canEdit) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage(t("EVALUATIONS.none_selected_websites"));
      setShowFeedbackModal(true);
      return;
    }
    try {
      const result = await evaluateWebsites(checkboxesSelected.map((item) => item.id));
      const { key, params } = getEvaluationFeedback(result);
      setFeedbackMessage(t(key, params));
      if (result.succeeded.length > 0) {
        setCheckboxesSelected([]);
        setSearch("");
        await fetchData(1, itemsPerPage, "");
      }
    } catch {
      setFeedbackMessage(t("EVALUATIONS.error"));
    }
    setShowFeedbackModal(true);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t("WEBSITES_PAGE.LIST.title_list")}</h1>
      <p>
        Abaixo encontra a listagem de todos os sítios web registados no
        AdminMonitorSuite, num total de {totalItems} sítios web.
      </p>
      <div>
        {canCreate && (
        <div className="d-flex gap-2 mb-3">
          <Button
            darkTheme={theme}
            text="Criar sítio web"
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => navigate("/dashboard/websites/create")}
          />
        </div>
        )}
        <ContentListWebSites
          onSortChange={onSortChange}
          title={t("WEBSITES_PAGE.LIST.subtitle_list")}
          checkboxesSelected={checkboxesSelected}
          setCheckboxesSelected={setCheckboxesSelected}
          data={data}
          setData={setData}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          search={search}
          handleSearchChange={handleSearchChange}
          onDeleteWebsites={handleDeleteWebsites}
          onDeletePagesWebsites={handleDeletePagesWebsites}
          onReevaluateWebsites={handleReevaluateWebsites}
          onCrawlWebsites={handleCrawlingWebsites}
          navigate={navigate}
          setItemsPerPage={setItemsPerPage}
        />
      </div>
      <Modal
        isOpen={showConfirmDeleteModal}
        onRequestClose={() => setShowConfirmDeleteModal(false)}
        title="Eliminar Sítios Web"
      >
        <p>Tem a certeza que pretende eliminar {checkboxesSelected.length} sítio(s) web selecionado(s)?</p>
        <div className="d-flex gap-2">
          <Button darkTheme={theme} text="Confirmar" className="btn-primary" onClick={confirmDeleteWebsites} />
          <Button darkTheme={theme} text="Cancelar" variant="danger" onClick={() => setShowConfirmDeleteModal(false)} />
        </div>
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
  );
};

export default WebSiteList;
