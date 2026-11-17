import { useState, useEffect, useCallback } from "react";
import qs from "qs";
import {
  Button,
  InputSearch,
  SortingTable,
  Breadcrumb,
} from "@a12e/accessmonitor-ds";
import "./style.users.css";
import { directoriesHeaders, columnsOptions, sortFields, nameOfIcons } from "./table.config";
import { useServerSort, MAX_ITEMS_PER_PAGE } from "../../hooks/useServerSort";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";
import { usePermissions } from "../../context/AuthContext";
import { filterEditColumn } from "../../utils/permissions";

// Matches the `permissionOptions` labels in UserCreateForm.jsx
const PERMISSION_LABELS = {
  manager: "Administrador",
  viewer: "Leitor",
  editor: "Editor",
};

const UserList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange, sortHeaders } = useServerSort(sortFields, () => setCurrentPage(1));
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem("currentPath");
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem("previousPath", lastPath);
    }
    localStorage.setItem("currentPath", currentPath);
  }, [location.pathname]);

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Utilizadores" },
  ];

  const fetchData = useCallback(async (page, limit, search) => {
    const queryObj = {
      sorts: sorts ?? { role: "DESC", updatedAt: "DESC" },
      pagination: { limit, page },
    };
    if (search) queryObj.filters = { searchTerm: search };
    const query = qs.stringify(queryObj);
    const response = await api.get(`/users?${query}`);
    const { data, pagination } = response.data;
    setAllUsers(
      data.map((item) => {
        const appLabel = item.role?.displayName ?? "—";
        return {
          id: item.id,
          Username: item.username,
          Aplicacao: appLabel == 'ADMIN' ? "AMS" : "MyMonitor",
          Perfil: PERMISSION_LABELS[item.permission] ?? item.permission ?? "—",
          Equipas:item.teamCount,
          SitiosWeb: item.websiteCount,
          edit: "Editar",
        };
      })
    );
    setTotalItems(pagination.totalItems);
  }, [sorts]);

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

  const handleDeleteUsers = () => {
    if (!canDelete) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um utilizador para eliminar.");
      setShowFeedbackModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmDeleteUsers = async () => {
    if (!canDelete) return;
    try {
      await Promise.all(
        checkboxesSelected.map(item =>
          api.delete(`/users/${item.id}`)
        )
      );
      setFeedbackMessage("Utilizadores eliminados com sucesso!");
      setCheckboxesSelected([]);
      await fetchData(1, itemsPerPage, "");
    } catch {
      setFeedbackMessage("Erro ao eliminar utilizadores. Tente novamente.");
    }
    setShowConfirmModal(false);
    setShowFeedbackModal(true);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t("BREADCRUMB.tag_here")} />
      <h1>{t("USERS_PAGE.LIST.title")}</h1>
      <p>
        {t("USERS_PAGE.LIST.subtitle")} num total de {totalItems} utilizadores.
      </p>

      <div className="content bg-white">
        {canCreate && (
        <div className="d-flex gap-2 mb-3">
          <Button
            darkTheme={theme}
            text="Criar utilizador"
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => navigate("/dashboard/users/create")}
          />
        </div>
        )}
        <h2>{t("USERS_PAGE.LIST.title")}</h2>
        <div className="d-flex gap-2 align-items-center mb-4">
          <span>{t("MISC.filter")}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t("MISC.filter") + " utilizadores..."}
            label={t("MISC.filter") + " utilizadores"}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={sortHeaders(filterEditColumn(directoriesHeaders, canEdit))}
          setDataList={setAllUsers}
          dataList={allUsers}
          columnsOptions={columnsOptions(navigate)}
          nextPage={() => null}
          caption={t("USERS_PAGE.LIST.table.title")}
          iconsAltTexts={nameOfIcons}
          project=""
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
          pagination={true}
          totalItems={totalItems}
          currentPage={currentPage}
          serverSidePagination={true}
          onSortChange={onSortChange}
          maxItemsPerPage={MAX_ITEMS_PER_PAGE}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          paginationButtonsTexts={[
            "Primeira página",
            "Página anterior",
            "Página seguinte",
            "Última página",
          ]}
          nItemsPerPageTexts={[
            "Ver",
            "por página",
            "Selector de itens por página",
            "Navegação do seletor de itens por página",
          ]}
          itemsPaginationTexts={[
            " de ",
            " itens ",
          ]}
          rowKey="id"
        />
        {canDelete && (
        <div className="d-flex gap-2 mt-3">
          <Button
            darkTheme={theme}
            text={t("USERS_PAGE.LIST.delete_users")}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteUsers}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        )}
      </div>
      <Modal
        isOpen={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
        title="Eliminar Utilizadores"
      >
        <p>Tem a certeza que pretende eliminar {checkboxesSelected.length} utilizador(es) selecionado(s)?</p>
        <div className="d-flex gap-2">
          <Button darkTheme={theme} text="Confirmar" className="btn-primary" onClick={confirmDeleteUsers} />
          <Button darkTheme={theme} text="Cancelar" variant="danger" onClick={() => setShowConfirmModal(false)} />
        </div>
      </Modal>
      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title="Utilizadores"
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

export default UserList;
