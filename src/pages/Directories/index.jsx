import { useEffect, useState, useCallback } from "react";
import qs from "qs";
import { Button, InputSearch, SortingTable, Breadcrumb } from "@a12e/accessmonitor-ds";
import { useTheme } from '../../context/ThemeContext';
import "./style.users.css";
import { directoriesHeaders, columnsOptions, nameOfIcons, sortFields } from "./table.config.jsx";
import { useServerSort, MAX_ITEMS_PER_PAGE } from "../../hooks/useServerSort";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import { setRootNavigationContext } from "../../utils/navigation";
import { usePermissions } from "../../context/AuthContext";
import { filterEditColumn } from "../../utils/permissions";

const DirectoriesList = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
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

  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem('openSubmenu', JSON.stringify({ id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" }));
    localStorage.setItem('activeMenuItem', JSON.stringify({ id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" }));
    setRootNavigationContext(null);
  }, []);

  const fetchData = useCallback(async (page, limit, search) => {
    setCheckboxesSelected([]);
    try {
      const queryObj = { pagination: { limit, page } };
      if (search) queryObj.filters = { searchTerm: search };
      if (sorts) queryObj.sorts = sorts;
      const query = qs.stringify(queryObj);
      const response = await api.get(`/directories?${query}`);
      const { data: items, pagination } = response.data;
      setData(
        items.map((item) => ({
          id: item.id,
          Name: item.name,
          Show_in_Observatory: item.isInObservatory ? "Sim" : "Não",
          edit: t('USERS_PAGE.LIST.table.edit_label'),
        }))
      );
      setTotalItems(pagination.totalItems);
    } catch {
      setFeedbackMessage("Erro ao carregar diretórios!");
      setShowFeedbackModal(true);
    }
  }, [t, sorts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(currentPage, itemsPerPage, searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, itemsPerPage, searchTerm, fetchData]);

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Diretórios" },
  ];

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

  const handleDeleteDirectories = async () => {
    if (!canDelete) return;
    try {
      await Promise.all(checkboxesSelected.map(item => api.delete(`/directories/${item.id}`)));
      setFeedbackMessage("Diretórios eliminados com sucesso!");
      setCheckboxesSelected([]);
      setSearchTerm("");
      setCurrentPage(1);
      await fetchData(1, itemsPerPage, "");
    } catch {
      setFeedbackMessage("Erro ao eliminar diretórios. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleDeleteDirectoriesPage = async () => {
    if (!canDelete) return;
    const response = await api.post(`/directory/pages/deleteBulk`, {
      directoriesId: checkboxesSelected
    });
    if (response.status === 200) {
      setCheckboxesSelected([]);
      await fetchData(currentPage, itemsPerPage, searchTerm);
    }
  };

  const handleReevaluatePages = async () => {
    if (!canEdit) return;
    const directoriesId = checkboxesSelected.map(item => item.id);
    try {
      const response = await api.post('/evaluations', {
        triggerType: "DIRECTORY",
        targetIds: directoriesId
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

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
      <h1>{t('DIRECTORIES_PAGE.LIST.title_list')}</h1>
      <p>Abaixo encontra a listagem de todos os diretórios registados no AdminMonitorSuite, num total de {totalItems} diretórios.</p>
      <div className="content bg-white">
        <div className="d-flex gap-2 mb-3">
          {canCreate && (
          <Button
            darkTheme={theme}
            text="Criar diretório"
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => navigate("/dashboard/directories/create")}
          />
          )}
        </div>
        <h2>{t('DIRECTORIES_PAGE.LIST.subtitle_list')}</h2>
        <div className="d-flex gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + ' diretórios...'}
            label={t('MISC.filter') + ' diretórios'}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={sortHeaders(filterEditColumn(directoriesHeaders, canEdit))}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions(navigate)}
          nextPage={() => null}
          caption={t('DIRECTORIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
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
          rowKey="id"
        />
        <div className="d-flex gap-4 justify-content-start mt-3">
          {canEdit && (
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.re_evaluate_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => setShowModal(true)}
            disabled={checkboxesSelected.length === 0}
          />
          )}
          {canDelete && (
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.delete_page')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteDirectoriesPage}
            disabled={checkboxesSelected.length === 0}
          />
          )}
          {canDelete && (
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.delete_directories')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteDirectories}
            disabled={checkboxesSelected.length === 0}
          />
          )}
        </div>
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          title={t('DIRECTORIES_PAGE.LIST.re_evaluate_pages')}
        >
          <p>Tem a certeza que pretende reavaliar os diretórios selecionados?</p>
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.re_evaluate_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleReevaluatePages}
          />
        </Modal>
        <Modal
          isOpen={showFeedbackModal}
          onRequestClose={() => setShowFeedbackModal(false)}
          title="Diretórios"
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
    </div>
  );
};

export default DirectoriesList;
