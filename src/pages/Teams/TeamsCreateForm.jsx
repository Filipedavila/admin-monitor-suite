import React, { useState, useEffect } from "react";
import { Input, Button, Breadcrumb } from "@a12e/accessmonitor-ds";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import MultiSelectTable from "../../components/MultiSelectTable";
import qs from "qs";

const TeamsCreateForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({ mode: "onChange" });
  const { t } = useTranslation();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const { id } = useParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const [websiteOptions, setWebsiteOptions] = useState([]);
  const [selectedWebsites, setSelectedWebsites] = useState([]);
  const originalWebsiteIdsRef = React.useRef([]);

  const [userOptions, setUserOptions] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const originalUserIdsRef = React.useRef([]);

  const watchedTeamName = watch("teamName");

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/teams">Equipas</Link> },
    {
      title: id ? "Editar equipa" : "Criar equipa",
    },
  ];

  const fetchWebsites = async (searchTerm = "") => {
    try {
      const queryObj = {
        pagination: { limit: 100, page: 1 },
      };
      if (searchTerm) queryObj.filters = { searchTerm };
      const query = qs.stringify(queryObj);
      const response = await api.get(`/websites?${query}`);
      const websitesData = response.data.data || [];
      const formatted = websitesData.map((w) => ({
        value: w.id,
        label: w.title,
      }));
      setWebsiteOptions(formatted);
    } catch (error) {
      console.error('Error fetching websites:', error);
      setWebsiteOptions([]);
    }
  };

  const fetchUsers = async (searchTerm = "") => {
    try {
      const queryObj = {
        pagination: { limit: 100, page: 1 },
      };
      if (searchTerm) queryObj.filters = { searchTerm };
      const query = qs.stringify(queryObj);
      const response = await api.get(`/users?${query}`);
      const usersData = response.data.data || [];
      const formatted = usersData.map((u) => ({
        value: u.id,
        label: u.username || String(u.id),
      }));
      setUserOptions(formatted);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUserOptions([]);
    }
  };

  useEffect(() => {
    fetchWebsites("");
    fetchUsers("");

    if (id) {
      const fetchTeam = async () => {
        try {
          // GET /teams/:id already embeds websites and users (TeamDetailsDTO),
          // so a single call is enough to prefill both tables.
          const teamResponse = await api.get(`/teams/${id}`);
          const team = teamResponse.data?.data ?? teamResponse.data;
          setValue("teamName", team.teamName);

          const teamWebsites = team.websites ?? [];
          const teamMembers = team.users ?? [];

          const websiteSelected = teamWebsites.map((w) => ({ value: w.id, label: w.baseUrl }));
          originalWebsiteIdsRef.current = websiteSelected.map((w) => w.value);
          setSelectedWebsites(websiteSelected);

          const userSelected = teamMembers.map((u) => ({ value: u.id, label: u.username }));
          originalUserIdsRef.current = userSelected.map((u) => u.value);
          setSelectedUsers(userSelected);
        } catch {
          // team not found — stay on blank form
        }
      };
      fetchTeam();
    }
  }, [id, setValue]);

  const handleWebsiteSearch = (value) => {
    fetchWebsites(value || "");
  };

  const handleWebsitesChange = (newSelected) => {
    setSelectedWebsites(newSelected);
    setValue("websiteIds", newSelected.map((item) => item.value));
  };

  const handleUserSearch = (value) => {
    fetchUsers(value || "");
  };

  const handleUsersChange = (newSelected) => {
    setSelectedUsers(newSelected);
    setValue("userIds", newSelected.map((item) => item.value));
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      let teamId = id;

      // There is no route to rename an existing team, so on edit we only sync
      // websites/members below and leave the name untouched.
      if (!id) {
        const response = await api.post("/teams", { teamName: data.teamName });
        teamId = response.data?.data?.id ?? response.data?.id;
      }

      const currentWebsiteIds = new Set(selectedWebsites.map((item) => Number(item.value)));
      const originalWebsiteIds = new Set(originalWebsiteIdsRef.current);
      const websitesToAdd = [...currentWebsiteIds].filter((wId) => !originalWebsiteIds.has(wId));
      const websitesToRemove = [...originalWebsiteIds].filter((wId) => !currentWebsiteIds.has(wId));

      const currentUserIds = new Set(selectedUsers.map((item) => Number(item.value)));
      const originalUserIds = new Set(originalUserIdsRef.current);
      const usersToAdd = [...currentUserIds].filter((uId) => !originalUserIds.has(uId));
      const usersToRemove = [...originalUserIds].filter((uId) => !currentUserIds.has(uId));

      const associations = [];
      if (websitesToAdd.length > 0 || websitesToRemove.length > 0) {
        associations.push(
          api.patch(`/teams/${teamId}/websites`, { add: websitesToAdd, remove: websitesToRemove })
        );
      }
      if (usersToAdd.length > 0 || usersToRemove.length > 0) {
        associations.push(
          api.patch(`/teams/${teamId}/members`, { add: usersToAdd, remove: usersToRemove })
        );
      }
      await Promise.all(associations);

      setFeedbackMessage(
        id ? "Equipa atualizada com sucesso!" : "Equipa criada com sucesso!"
      );
      if (!id) reset();
    } catch (error) {
      if (error.response?.status === 409) {
        setFeedbackMessage("Já existe uma equipa com este nome.");
      } else if (error.response?.status === 400) {
        setFeedbackMessage("Dados inválidos. Verifique as informações inseridas.");
      } else {
        setFeedbackMessage(
          id
            ? "Erro ao atualizar equipa. Tente novamente."
            : "Erro ao criar equipa. Tente novamente."
        );
      }
    } finally {
      setIsSubmitting(false);
      setShowFeedbackModal(true);
    }
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{id ? "Editar equipa" : "Criar equipa"}</h1>
      <p>Nota: as equipas estão disponíveis apenas para utilizadores MyMonitor.</p>
      <form className="bg-white" onSubmit={handleSubmit(onSubmit)}>
        <div className="w-50 d-flex flex-column gap-3">
          <Input
            label="Nome da equipa"
            name="teamName"
            type="text"
            darkTheme={theme}
            value={watchedTeamName}
            placeholder="Nome da equipa"
            disabled={!!id}
            {...register("teamName", {
              required: <div dangerouslySetInnerHTML={{ __html: t("MISC.required_field") }} />,
              maxLength: { value: 200, message: "O nome não pode exceder 200 caracteres" },
            })}
            onChange={(e) => setValue("teamName", e.target.value)}
            error={errors.teamName?.message}
            autoComplete="off"
          />
          {id && (
            <p className="text-muted" style={{ marginTop: "-8px" }}>
              O nome da equipa não pode ser alterado depois de criada.
            </p>
          )}
          {!id && (
            <p className="text-muted" style={{ marginTop: "-8px" }}>
              Não é obrigatório associar utilizadores ou sítios web no momento da criação da equipa.
            </p>
          )}

          <MultiSelectTable
            id="websiteIds"
            darkTheme={theme}
            label="Sítios web"
            placeholder="Selecione sítios web"
            options={websiteOptions}
            selected={selectedWebsites}
            onSelectedChange={handleWebsitesChange}
            onInputChange={handleWebsiteSearch}
            columnLabel="Sítio Web"
            tableCaption="Sítios web selecionados"
            emptyMessage="Nenhum sítio web selecionado."
          />

          <MultiSelectTable
            id="userIds"
            darkTheme={theme}
            label="Utilizadores"
            placeholder="Selecione utilizadores"
            options={userOptions}
            selected={selectedUsers}
            onSelectedChange={handleUsersChange}
            onInputChange={handleUserSearch}
            columnLabel="Utilizador"
            tableCaption="Utilizadores selecionados"
            emptyMessage="Nenhum utilizador selecionado."
          />

          <div className="d-flex justify-content-start gap-3">
            <Button
              darkTheme={theme}
              type="submit"
              text={isSubmitting ? "A guardar..." : id ? t("ADMIN_CONSOLE.update_and_exit") : t("ADMIN_CONSOLE.save_and_exit")}
              disabled={isSubmitting || !watchedTeamName}
            />
            <Button
              darkTheme={theme}
              text="Sair"
              variant="danger"
              onClick={() => navigate("/dashboard/teams")}
            />
          </div>
        </div>
      </form>

      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title={id ? "Editar Equipa" : "Criar Equipa"}
      >
        <p>{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text="OK"
          className="btn-primary"
          onClick={() => {
            setShowFeedbackModal(false);
            if (
              feedbackMessage === "Equipa criada com sucesso!" ||
              feedbackMessage === "Equipa atualizada com sucesso!"
            ) {
              navigate("/dashboard/teams");
            }
          }}
        />
      </Modal>
    </div>
  );
};

export default TeamsCreateForm;
