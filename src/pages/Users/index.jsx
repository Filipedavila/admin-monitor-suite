import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  InputSearch,
  SortingTable,
  Breadcrumb,
} from "ama-design-system";
import "./style.users.css";
import {
  directoriesHeaders,
  columnsOptions,
  nameOfIcons,
  paginationButtonsTexts,
} from "./table.config";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import moment from "moment";
import { Modal } from "../../components/Modal";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";

const UserList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [allUsers, setAllUsers] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
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

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Utilizadores" },
  ];

  const fetchData = async () => {
    const response = await api.get("/user/all");
    setAllUsers(
      response.data.result.map((item) => ({
        id: item.UserId,
        Username: item.Username,
        Type: item.Type === "nimda" ? "AMS" : "MyMonitor",
        Websites: item.Websites + "",
        Last_Login: moment(item.Last_Login).format("DD/MM/YYYY"),
        Register_Date: moment(item.Register_Date).format("DD/MM/YYYY"),
        edit: "Editar",
      }))
    );
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return allUsers;
    }
    return allUsers.filter((user) =>
      user.Username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsers, searchTerm]);

  const totalItems = filteredUsers.length;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUsers.slice(start, end);
  }, [filteredUsers, currentPage, itemsPerPage]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle delete users
  const handleDeleteUsers = async () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage(
        "Por favor, selecione pelo menos um utilizador para eliminar."
      );
      setShowFeedbackModal(true);
      return;
    }

    try {
      const userIds = checkboxesSelected.map(async (item) => {
        const response = await api.post("/user/delete", {
          userId: item.id,
          app: "nimda",
        });
        return response.data.result.UserId;
      });
      setFeedbackMessage("Utilizadores eliminados com sucesso!");
      setCheckboxesSelected([]);
      setSearchTerm("");
      fetchData();
    } catch (error) {
      setFeedbackMessage("Erro ao eliminar utilizadores. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const onSubmit = (formData) => {
    console.log("User data:", formData);
    // Lógica de criação de utilizador, se for o caso
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t("BREADCRUMB.tag_here")} />
      <h1>{t("USERS_PAGE.LIST.title")}</h1>
      <p>
        {t("USERS_PAGE.LIST.subtitle")} num total de {totalItems} utilizadores.
      </p>

      <div className="content bg-white">
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
        <Button
          darkTheme={theme}
          text={t("USERS_PAGE.LIST.delete_users")}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary mb-3"
          onClick={handleDeleteUsers}
          disabled={checkboxesSelected.length === 0}
        />

        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setAllUsers}
          dataList={paginatedData}
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
            "Ver", // see
            "por página", // per_page
            "Selector de itens por página", // selectorAria
            "Navegação do seletor de itens por página", // selectorNav
          ]}
          itemsPaginationTexts={[
            " de ", // of
            " itens ", // items
          ]}
          rowKey="id"
        />
      </div>
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
