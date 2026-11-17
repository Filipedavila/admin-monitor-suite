import { useState, useEffect, useCallback } from "react";
import qs from "qs";
import { Button, InputSearch, SortingTable, Breadcrumb, MultiSelect } from "@a12e/accessmonitor-ds";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../../context/ThemeContext";
import { api } from "../../../config/api";
import { Modal } from "../../../components/Modal";
import { useUniqueCheckboxSelection } from "../../../hooks/useUniqueCheckboxSelection";
import { usePermissions } from "../../../context/AuthContext";

/**
 * Generic "view + add" list of one type of resource (users or websites)
 * associated with a team. Config-driven so TeamUsers/TeamWebsites can each
 * pass their own API paths and labels instead of duplicating this page.
 */
const TeamResourceList = ({ resource }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  // Adding/removing team associations is an edit of the team, not a delete.
  const { canEdit } = usePermissions();

  const [teamName, setTeamName] = useState("");
  const [items, setItems] = useState([]);
  const [originalItems, setOriginalItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [addOptions, setAddOptions] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem("currentPath");
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem("previousPath", lastPath);
    }
    localStorage.setItem("currentPath", currentPath);
  }, [location.pathname]);

  const fetchTeam = useCallback(async () => {
    setIsLoading(true);
    try {
      const [teamResponse, resourceResponse] = await Promise.all([
        api.get(`/teams/${id}`),
        api.get(resource.fetchApiPath(id)),
      ]);
      const team = teamResponse.data?.data ?? teamResponse.data;
      setTeamName(team.teamName);
      const resourceItems = resourceResponse.data?.data ?? resourceResponse.data ?? [];
      const rows = resourceItems.map(resource.mapRow);
      setItems(rows);
      setOriginalItems(rows);
    } catch {
      setFeedbackMessage(`Erro ao carregar ${resource.label.toLowerCase()} da equipa.`);
      setShowFeedbackModal(true);
    } finally {
      setIsLoading(false);
    }
  }, [id, resource]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setItems(originalItems);
    } else {
      setItems(
        originalItems.filter((item) =>
          resource.matchesSearch(item, searchTerm.toLowerCase())
        )
      );
    }
  }, [searchTerm, originalItems, resource]);

  const fetchAddOptions = useCallback(async (search = "") => {
    try {
      const queryObj = { pagination: { limit: 100, page: 1 } };
      if (search) queryObj.filters = { searchTerm: search };
      const query = qs.stringify(queryObj);
      const response = await api.get(`${resource.searchApiPath}?${query}`);
      const rawData = response.data.data || [];
      const currentIds = new Set(originalItems.map((item) => item.id));
      const formatted = rawData
        .filter((entry) => !currentIds.has(entry.id))
        .map((entry) => ({ value: entry.id, label: resource.optionLabel(entry) }));
      setAddOptions(formatted);
    } catch {
      setAddOptions([]);
    }
  }, [resource, originalItems]);

  const handleOpenAddModal = () => {
    setSelectedToAdd([]);
    fetchAddOptions("");
    setShowAddModal(true);
  };

  const handleConfirmAdd = async () => {
    if (!canEdit || selectedToAdd.length === 0) return;
    setIsSubmittingAdd(true);
    try {
      await api.patch(resource.patchApiPath(id), { add: selectedToAdd, remove: [] });
      setShowAddModal(false);
      setFeedbackMessage(`${resource.label} adicionado(s) com sucesso!`);
      await fetchTeam();
    } catch {
      setFeedbackMessage(`Erro ao adicionar ${resource.label.toLowerCase()}. Tente novamente.`);
    } finally {
      setIsSubmittingAdd(false);
      setShowFeedbackModal(true);
    }
  };

  const handleRemoveSelected = async () => {
    if (!canEdit) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage(`Por favor, selecione pelo menos ${resource.singularArticle} para remover.`);
      setShowFeedbackModal(true);
      return;
    }
    try {
      const removeIds = checkboxesSelected.map((item) => item.id);
      await api.patch(resource.patchApiPath(id), { add: [], remove: removeIds });
      setCheckboxesSelected([]);
      setFeedbackMessage(`${resource.label} removido(s) da equipa com sucesso!`);
      await fetchTeam();
    } catch {
      setFeedbackMessage(`Erro ao remover ${resource.label.toLowerCase()}. Tente novamente.`);
    }
    setShowFeedbackModal(true);
  };

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/teams">Equipas</Link> },
    { title: teamName || "…" },
    { title: resource.label },
  ];

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{resource.label} da equipa {teamName}</h1>
      <p>
        Abaixo encontra a listagem de {resource.label.toLowerCase()} desta equipa, num total de {items.length} {items.length === 1 ? resource.singularLabel : resource.label.toLowerCase()}.
      </p>

      <div className="content bg-white">
        {canEdit && (
        <div className="d-flex gap-2 mb-3">
          <Button
            darkTheme={theme}
            text={resource.addButtonText}
            icon="AMA-Adicionar-Line"
            className="btn-primary"
            onClick={handleOpenAddModal}
          />
        </div>
        )}
        <h2>{resource.label}</h2>
        <div className="d-flex gap-2 align-items-center mb-4">
          <span>Filtrar</span>
          <InputSearch
            darkTheme={theme}
            placeholder={`Filtrar ${resource.label.toLowerCase()}...`}
            label={`Filtrar ${resource.label.toLowerCase()}`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(typeof e === "string" ? e : (e?.target?.value ?? ""))}
          />
        </div>
        {isLoading ? (
          <p className="text-muted">A carregar...</p>
        ) : (
          <SortingTable
            darkTheme={theme}
            hasSort={false}
            headers={resource.headers}
            setDataList={setItems}
            dataList={items}
            columnsOptions={resource.columnsOptions(navigate)}
            nextPage={() => null}
            caption={`Tabela de ${resource.label.toLowerCase()} da equipa`}
            iconsAltTexts={[]}
            project=""
            setCheckboxesSelected={setCheckboxesSelected}
            checkedItems={checkboxesSelected}
            pagination={false}
            rowKey="id"
            itemsPaginationTexts={[]}
            nItemsPerPageTexts={[]}
            paginationButtonsTexts={[]}
          />
        )}
        {canEdit && (
        <div className="d-flex gap-2 mt-3">
          <Button
            darkTheme={theme}
            text={resource.removeButtonText}
            icon="AMA-Adicionar-Line"
            className="btn-primary"
            onClick={handleRemoveSelected}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        )}
      </div>

      <Modal
        isOpen={showAddModal}
        onRequestClose={() => setShowAddModal(false)}
        title={resource.addButtonText}
      >
        <div className="d-flex flex-column gap-3">
          <MultiSelect
            id="resourceIds"
            darkTheme={theme}
            label={resource.label}
            name="resourceIds"
            value={selectedToAdd}
            onChange={(values) => setSelectedToAdd(values || [])}
            onInputChange={(value) => fetchAddOptions(value || "")}
            options={addOptions}
            placeholder={`Selecione ${resource.label.toLowerCase()}`}
            isValid={true}
          />
          <div className="d-flex gap-2">
            <Button
              darkTheme={theme}
              text={isSubmittingAdd ? "A adicionar..." : "Adicionar"}
              className="btn-primary"
              onClick={handleConfirmAdd}
              disabled={isSubmittingAdd || selectedToAdd.length === 0}
            />
            <Button
              darkTheme={theme}
              text="Cancelar"
              variant="danger"
              onClick={() => setShowAddModal(false)}
            />
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title={resource.label}
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

export default TeamResourceList;
