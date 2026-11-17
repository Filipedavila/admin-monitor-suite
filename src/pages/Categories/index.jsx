import { useState, useEffect, useCallback } from "react";
import qs from "qs";
import { Button, InputSearch, SortingTable, Breadcrumb } from "@a12e/accessmonitor-ds";
import "./style.users.css";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { categoriesHeaders, columnsOptions, nameOfIcons, sortFields } from "./table.config.jsx";
import { useServerSort, MAX_ITEMS_PER_PAGE } from "../../hooks/useServerSort";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import { setRootNavigationContext } from "../../utils/navigation";
import { usePermissions } from "../../context/AuthContext";
import { filterEditColumn } from "../../utils/permissions";
import { crawlTags, getCrawlTagsFeedback } from "../../services/discovery";

const CategoriesList = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange, sortHeaders } = useServerSort(sortFields, () => setCurrentPage(1));
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [feedbackRole, setFeedbackRole] = useState(null);
  const [isCrawling, setIsCrawling] = useState(false);

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Categorias" }
  ];

  useEffect(() => {
    setRootNavigationContext(null);
  }, []);

  const fetchData = useCallback(async (page, limit, search) => {
    setCheckboxesSelected([]);
    try {
      const queryObj = { pagination: { limit, page } };
      if (search) queryObj.filters = { searchTerm: search };
      if (sorts) queryObj.sorts = sorts;
      const query = qs.stringify(queryObj);
      const response = await api.get(`/tags?${query}`);
      const { data: items, pagination } = response.data;
      setData(
        items.map((item) => ({
          id: item.id,
          Name: item.name,
          edit: t('USERS_PAGE.LIST.table.edit_label'),
        }))
      );
      setTotalItems(pagination.totalItems);
    } catch {
      setFeedbackMessage("Erro ao carregar categorias!");
      setShowFeedbackModal(true);
    }
  }, [t, sorts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(currentPage, itemsPerPage, searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, itemsPerPage, searchTerm, fetchData]);

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    const value = typeof e === 'string' ? e : (e?.target?.value ?? "");
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDeletePagesCategories = async () => {
    if (!canDelete) return;
    const categoriesId = checkboxesSelected.map(item => item.id);
    const response = await api.post(`/tag/pages/deleteBulk`, { tagsId: categoriesId });
    if (response.status === 201 || response.status === 200) {
      setFeedbackMessage("Páginas eliminadas com sucesso!");
      setCheckboxesSelected([]);
      await fetchData(currentPage, itemsPerPage, searchTerm);
    } else {
      setFeedbackMessage("Ocorreu um erro ao eliminar as páginas.");
    }
    setShowFeedbackModal(true);
  };

  const handleDeleteCategories = async () => {
    if (!canDelete) return;
    try {
      await Promise.all(checkboxesSelected.map(item => api.delete(`/tags/${item.id}`)));
      setFeedbackMessage("Categorias eliminadas com sucesso!");
      setCheckboxesSelected([]);
      setSearchTerm("");
      setCurrentPage(1);
      await fetchData(1, itemsPerPage, "");
    } catch {
      setFeedbackMessage("Erro ao eliminar categorias. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleReevaluateCategories = async () => {
    if (!canEdit) return;
    const categoriesId = checkboxesSelected.map(item => item.id);
    try {
      const response = await api.post('/evaluations', {
        triggerType: "TAGS",
        targetIds: categoriesId
      });
      setShowModal(false);
      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível.");
      } else {
        setFeedbackMessage("Ocorreu um erro ao iniciar a reavaliação.");
      }
      setShowFeedbackModal(true);
    } catch {
      setShowModal(false);
      setFeedbackMessage("Ocorreu um erro ao iniciar a reavaliação.");
      setShowFeedbackModal(true);
    }
  };

  // Crawl por categoria (v5 "Discovery > Crawl Website Tags"): um POST /discovery/:tagId por categoria.
  const handleCrawlingCategories = async () => {
    if (!canEdit || isCrawling) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage(t("CRAWL_TAGS.none_selected"));
      setFeedbackRole("alert");
      setShowFeedbackModal(true);
      return;
    }
    setIsCrawling(true);
    try {
      const result = await crawlTags(checkboxesSelected.map((item) => item.id));
      const { key, params, role } = getCrawlTagsFeedback(result);
      setFeedbackMessage(t(key, params));
      setFeedbackRole(role);
      if (result.failed.length === 0) {
        setCheckboxesSelected([]);
      } else {
        // Mantém selecionadas só as categorias que falharam, para poder repetir.
        const failedIds = new Set(result.failed.map((f) => f.id));
        setCheckboxesSelected((prev) => prev.filter((item) => failedIds.has(Number(item.id))));
      }
    } catch {
      setFeedbackMessage(t("CRAWL_TAGS.error"));
      setFeedbackRole("alert");
    } finally {
      setIsCrawling(false);
    }
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setFeedbackRole(null);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
      <h1>{t('CATEGORIES_PAGE.LIST.title')}</h1>
      <p>Abaixo encontra a listagem de todas as categorias registadas no AdminMonitorSuite, num total de {totalItems} categorias.</p>
      <div className="content bg-white">
        <div className="d-flex gap-2 mb-3">
          {canCreate && (
          <Button
            darkTheme={theme}
            text="Criar categoria"
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => navigate("/dashboard/categories/create")}
          />
          )}
        </div>
        <h2>{t('CATEGORIES_PAGE.LIST.subtitle')}</h2>
        <div className="d-flex gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + ' categorias...'}
            label={t('MISC.filter') + ' categorias'}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={sortHeaders(filterEditColumn(categoriesHeaders, canEdit))}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions(navigate)}
          nextPage={() => null}
          caption={t('CATEGORIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={[
            "Primeira página",
            "Página anterior",
            "Página seguinte",
            "Última página"
          ]}
          nItemsPerPageTexts={[
            "Ver",
            "por página",
            "Selector de itens por página",
            "Navegação do seletor de itens por página"
          ]}
          itemsPaginationTexts={[
            " de ",
            " itens "
          ]}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
          pagination={true}
          serverSidePagination={true}
          onSortChange={onSortChange}
          maxItemsPerPage={MAX_ITEMS_PER_PAGE}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          rowKey="id"
        />
        <div className="d-flex gap-4 justify-content-start mt-3">
          {canEdit && (
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.re_evaluate_tags')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => setShowModal(true)}
            disabled={checkboxesSelected.length === 0}
          />
          )}
          {canEdit && (
          <Button
            darkTheme={theme}
            text={t('CRAWL_TAGS.button_selected')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleCrawlingCategories}
            loading={isCrawling}
            loadingText={t('CRAWL_TAGS.loading')}
            aria-busy={isCrawling}
            disabled={checkboxesSelected.length === 0 || isCrawling}
          />
          )}
          {canDelete && (
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.delete_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeletePagesCategories}
            disabled={checkboxesSelected.length === 0}
          />
          )}
          {canDelete && (
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.delete_tags')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteCategories}
            disabled={checkboxesSelected.length === 0}
          />
          )}
        </div>
      </div>
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        title={t('CATEGORIES_PAGE.LIST.re_evaluate_tags')}
      >
        <p>Tem a certeza que pretende reavaliar as categorias selecionadas?</p>
        <Button
          darkTheme={theme}
          text={t('CATEGORIES_PAGE.LIST.re_evaluate_tags')}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={handleReevaluateCategories}
        />
      </Modal>
      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={closeFeedbackModal}
        title="Categorias"
      >
        <p role={feedbackRole || undefined}>{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text="OK"
          className="btn-primary"
          onClick={closeFeedbackModal}
        />
      </Modal>
    { /* <CrawlingModal
        isOpen={showCrawlingModal}
        onRequestClose={() => setShowCrawlingModal(false)}
        onSubmit={handleCrawlingCategories}
        theme={theme}
        selectedItems={checkboxesSelected}
        itemType="categories"
      />*/}
    </div>
  );
};

export default CategoriesList;
