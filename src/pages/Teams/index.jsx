import { useState, useEffect, useCallback } from "react";
import qs from "qs";
import {
  Button,
  InputSearch,
  SortingTable,
  Breadcrumb,
} from "@a12e/accessmonitor-ds";
import { teamsHeaders, sortFields, columnsOptions, nameOfIcons } from "./table.config";
import { useServerSort, MAX_ITEMS_PER_PAGE } from "../../hooks/useServerSort";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";
import { usePermissions } from "../../context/AuthContext";
import { filterEditColumn } from "../../utils/permissions";

const TeamsList = () => {
  const navigate = useNavigate();
  const { canCreate, canEdit, canDelete } = usePermissions();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [allTeams, setAllTeams] = useState([]);
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
    { title: "Equipas" },
  ];

  const fetchData = useCallback(async (page, limit, search) => {
    const queryObj = {
      sorts: sorts ?? { updatedAt: "DESC" },
      pagination: { limit, page },
    };
    if (search) queryObj.filters = { searchTerm: search };
    const query = qs.stringify(queryObj);
    const response = await api.get(`/teams?${query}`);
    const { data, pagination } = response.data;
    setAllTeams(
      data.map((item) => ({
        id: item.id,
        TeamName: item.teamName,
        // /teams list doesn't embed users/websites yet — fall back to a count
        // field if the API adds one later, otherwise show 0.
        Utilizadores: Array.isArray(item.users) ? item.users.length : (item.usersCount ?? 0),
        SitiosWeb: Array.isArray(item.websites) ? item.websites.length : (item.websitesCount ?? 0),
        edit: "Editar",
      }))
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
    const value = typeof e === "string" ? e : (e?.target?.value ?? "");
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleDeleteTeams = () => {
    if (!canDelete) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos uma equipa para eliminar.");
      setShowFeedbackModal(true);
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmDeleteTeams = async () => {
    if (!canDelete) return;
    try {
      await Promise.all(
        checkboxesSelected.map((item) => api.delete(`/teams/${item.id}`))
      );
      setFeedbackMessage("Equipas eliminadas com sucesso!");
      setCheckboxesSelected([]);
      await fetchData(1, itemsPerPage, "");
    } catch {
      setFeedbackMessage("Erro ao eliminar equipas. Tente novamente.");
    }
    setShowConfirmModal(false);
    setShowFeedbackModal(true);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t("BREADCRUMB.tag_here")} />
      <h1>Equipas</h1>
      <p>A listagem de todas as equipas registadas no AMS, num total de {totalItems} equipa(s).</p>

      <div className="content bg-white">
        {canCreate && (
        <div className="d-flex gap-2 mb-3">
          <Button
            darkTheme={theme}
            text="Nova Equipa"
            icon="AMA-Adicionar-Line"
            className="btn-primary"
            onClick={() => navigate("/dashboard/teams/create")}
          />
        </div>
        )}
        <h2>Equipas</h2>
        <div className="d-flex gap-2 align-items-center mb-4">
          <span>{t("MISC.filter")}</span>
          <InputSearch
            darkTheme={theme}
            placeholder="Filtrar equipas..."
            label="Filtrar equipas"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={sortHeaders(filterEditColumn(teamsHeaders, canEdit))}
          setDataList={setAllTeams}
          dataList={allTeams}
          columnsOptions={columnsOptions(navigate)}
          nextPage={() => null}
          caption="Tabela de equipas"
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
          itemsPaginationTexts={[" de ", " itens "]}
          rowKey="id"
        />
        {canDelete && (
        <div className="d-flex gap-2 mt-3">
          <Button
            darkTheme={theme}
            text="Apagar Equipa"
            icon="AMA-Adicionar-Line"
            className="btn-primary"
            onClick={handleDeleteTeams}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        )}
      </div>

      <Modal
        isOpen={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
        title="Eliminar Equipas"
      >
        <p>
          Tem a certeza que pretende eliminar {checkboxesSelected.length} equipa(s) selecionada(s)?
        </p>
        <div className="d-flex gap-2">
          <Button
            darkTheme={theme}
            text="Confirmar"
            className="btn-primary"
            onClick={confirmDeleteTeams}
          />
          <Button
            darkTheme={theme}
            text="Cancelar"
            variant="danger"
            onClick={() => setShowConfirmModal(false)}
          />
        </div>
      </Modal>

      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title="Equipas"
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

export default TeamsList;
