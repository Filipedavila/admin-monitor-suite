import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  InputSearch,
  SortingTable,
  Breadcrumb,
} from "@a12e/accessmonitor-ds";
import "./style.users.css";
import { nameOfIcons, pagesUsersHeaders, pagesUsersColumnsOptions } from "./table.config";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import moment from "moment";
import { Modal } from "../../components/Modal";
import { usePermissions } from "../../context/AuthContext";

const PagesForUsers = () => {
  const { canEdit } = usePermissions();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [pagesData, setPagesData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
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
  const { name, username } = useParams();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/users">Utilizadores</Link> },
    {
      children: (
        <Link to={`/dashboard/users/websites/${username}`}>
          Sítios Web do Utilizador {username}
        </Link>
      ),
    },
    { title: name },
  ];

  const fetchData = async () => {
    const response = await api.get(
      `/tag/null/website/${name}/user/${username}/pages`
    );
    const mappedData = response.data.result.map((item) => ({
      id: item.PageId,
      Url: item.Uri,
      Score: item.Score,
      Username: username,
      Name: name,
      ShowIn: item.Show_In,
      Evaluation_Date: moment(item.Evaluation_Date).format("DD/MM/YYYY"),
      import: "Importar",
    }));
    setPagesData(mappedData);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term
  const filteredPages = useMemo(() => {
    if (!searchTerm.trim()) {
      return pagesData;
    }
    return pagesData.filter((page) =>
      page.Uri.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [pagesData, searchTerm]);

  const totalItems = filteredPages.length;

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Handle import page
  const handleImportPage = React.useCallback(
    async (page) => {
      if (!canEdit) return;
      
      // Check if button should be disabled
      if (page.ShowIn === "010") {
        setFeedbackMessage(
          "Esta página não pode ser importada (ShowIn = 010)."
        );
        setShowFeedbackModal(true);
        return;
      }

      try {
        await api.post("/page/import", {
          pageId: page.id,
          user: username,
          website: name,
        });

        setFeedbackMessage("Página importada com sucesso!");
        fetchData(); // Refresh the data
      } catch (error) {
        console.error("Import error:", error);
        setFeedbackMessage("Erro ao importar página. Tente novamente.");
      }
      setShowFeedbackModal(true);
    },
    [username, name, fetchData, canEdit]
  );

  // Check if page can be imported
  const canImportPage = (page) => {
    return page.ShowIn !== "010";
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t("BREADCRUMB.tag_here")} />
      <h1>Páginas do Sítio Web - {name}</h1>

      <div className="content bg-white">
        <h2>Utilizador: {username} </h2>
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
          headers={canEdit ? pagesUsersHeaders : pagesUsersHeaders.map((row) => row.filter((header) => header.property !== "import"))}
          setDataList={setPagesData}
          dataList={filteredPages}
          columnsOptions={pagesUsersColumnsOptions(
            navigate,
            handleImportPage,
            canImportPage
          )}
          nextPage={() => null}
          caption={t("PAGES_PAGE.LIST.table.title")}
          iconsAltTexts={nameOfIcons}
          project=""
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
          pagination={true}
          totalItems={totalItems}
          currentPage={currentPage}
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
        title="Importar Página"
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

export default PagesForUsers;
