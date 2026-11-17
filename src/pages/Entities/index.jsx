import { useState, useEffect, useCallback } from "react";
import qs from "qs";
import { Button, InputSearch, SortingTable, Breadcrumb } from "@a12e/accessmonitor-ds";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../../components/Modal";
import { useTheme } from '../../context/ThemeContext';
import "./style.users.css";
import { directoriesHeaders, columnsOptions, nameOfIcons, sortFields } from "./table.config.jsx";
import { useServerSort, MAX_ITEMS_PER_PAGE } from "../../hooks/useServerSort";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import moment from "moment";
import { setRootNavigationContext } from "../../utils/navigation";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";
import { usePermissions } from "../../context/AuthContext";
import { filterEditColumn } from "../../utils/permissions";

const EntitiesList = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange, sortHeaders } = useServerSort(sortFields, () => setCurrentPage(1));
  const [search, setSearch] = useState("");
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
    setRootNavigationContext(null);
  }, []);

  const fetchData = useCallback(async (page, limit, searchValue) => {
    setCheckboxesSelected([]);
    try {
      const queryObj = { pagination: { limit, page } };
      if (searchValue) queryObj.filters = { searchTerm: searchValue };
      if (sorts) queryObj.sorts = sorts;
      const query = qs.stringify(queryObj);
      const response = await api.get(`/institutions/?${query}`);
      const { data: items, pagination } = response.data;
      setData(
        items.map((item) => ({
          id: item.id,
          Short_Name: item.shortName,
          Long_Name: item.longName,
          Creation_at: moment(item.createdAt).format('DD/MM/YYYY'),
          edit: t('USERS_PAGE.LIST.table.edit_label'),
        }))
      );
      setTotalItems(pagination.totalItems);
    } catch {
      setFeedbackMessage("Erro ao carregar entidades!");
      setShowFeedbackModal(true);
    }
  }, [t, sorts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(currentPage, itemsPerPage, search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, itemsPerPage, search, fetchData]);

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Entidades" },
  ];

  const handleSearchChange = (e) => {
    const value = typeof e === 'string' ? e : (e?.target?.value ?? "");
    setSearch(value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => setCurrentPage(page);

  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleDeleteEntities = async () => {
    if (!canDelete) return;
    try {
      await Promise.all(checkboxesSelected.map(item => api.delete('/institutions', { data: { institutionId: item.id } })));
      setFeedbackMessage("Entidades eliminadas com sucesso!");
      setCheckboxesSelected([]);
      setSearch("");
      setCurrentPage(1);
      await fetchData(1, itemsPerPage, "");
    } catch {
      setFeedbackMessage("Erro ao eliminar entidades. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleDeletePagesEntities = async () => {
    if (!canDelete) return;
    const entitiesId = checkboxesSelected.map(item => item.id);
    const response = await api.post(`/entity/pages/deleteBulk`, { entitiesId });
    if (response.status === 201 || response.status === 200) {
      setFeedbackMessage("Páginas eliminadas com sucesso!");
      setCheckboxesSelected([]);
      setSearch("");
      await fetchData(currentPage, itemsPerPage, search);
      setShowFeedbackModal(true);
    } else {
      setFeedbackMessage("Ocorreu um erro ao eliminar as páginas.");
      setShowFeedbackModal(true);
    }
  };

  const handleReevaluateEntities = async () => {
    if (!canEdit) return;
    const entitiesId = checkboxesSelected.map(item => item.id);
    try {
      const response = await api.post('/evaluations', {
        triggerType: "INSTITUTION",
        targetIds: entitiesId
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
      <h1>{t('ENTITIES_PAGE.LIST.title')}</h1>
      <p>
        Abaixo encontra a listagem de todas as entidades registadas no AdminMonitorSuite, num total de {totalItems} entidades.
      </p>
      <div className="content bg-white">
        {canCreate && (
        <div className="d-flex gap-2 mb-3">
          <Button
            darkTheme={theme}
            text="Criar entidade"
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => navigate("/dashboard/entities/create")}
          />
        </div>
        )}
        <h2>{t('ENTITIES_PAGE.LIST.subtitle')}</h2>
        <div className="d-flex gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + '...'}
            label={t('MISC.filter')}
            value={search}
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
          caption={t('ENTITIES_PAGE.LIST.table.title')}
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
            text={t('ENTITIES_PAGE.LIST.re_evaluate_entities')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => setShowModal(true)}
            disabled={checkboxesSelected.length === 0}
          />
          )}
          {canDelete && (
          <>
          <Button
            darkTheme={theme}
            text={t('ENTITIES_PAGE.LIST.delete_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeletePagesEntities}
            disabled={checkboxesSelected.length === 0}
          />
          <Button
            darkTheme={theme}
            text={t('ENTITIES_PAGE.LIST.delete_entities')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteEntities}
            disabled={checkboxesSelected.length === 0}
          />
          </>
          )}
        </div>
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          title={t('ENTITIES_PAGE.LIST.re_evaluate_entities')}
        >
          <p>Tem a certeza que pretende reavaliar as entidades selecionadas?</p>
          <Button
            darkTheme={theme}
            text={t('ENTITIES_PAGE.LIST.re_evaluate_entities')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleReevaluateEntities}
          />
        </Modal>
        <Modal
          isOpen={showFeedbackModal}
          onRequestClose={() => setShowFeedbackModal(false)}
          title="Entidades"
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

export default EntitiesList;
