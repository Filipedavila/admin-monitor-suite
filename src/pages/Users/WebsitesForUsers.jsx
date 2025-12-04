import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  InputSearch,
  SortingTable,
  Breadcrumb,
} from "ama-design-system";
import i18n from '../../i18n';

import "./style.users.css";
import {
  directoriesHeaders,
  columnsOptions,
  nameOfIcons,
  paginationButtonsTexts,
  websiteUsersHeaders,
  websiteUsersColumnsOptions,
} from "./table.config";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import moment from "moment";
import { Modal } from "../../components/Modal";

const WebsitesForUsers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [websitesData, setWebsitesData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState(null);

  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);
  const { name } = useParams();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/users">Utilizadores</Link> },
    { title: "Sítios Web do Utilizador " + name }
  ];

  const fetchData = async () => {
    const response = await api.get(`/user/websites/${name}`);
    setWebsitesData(response.data.result.map(item => ({
      Username: name,
      id: item.WebsiteId,
      Name: item.Name,
      StartingUrl: item.StartingUrl,
      Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
      import: "Importar",
    })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter users based on search term
  const filteredWebsites = useMemo(() => {
    if (!searchTerm.trim()) {
      return websitesData;
    }
    return websitesData.filter(website =>
      website.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [websitesData, searchTerm]);

  const totalItems = filteredWebsites.length;

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
      setFeedbackMessage("Por favor, selecione pelo menos um utilizador para eliminar.");
      setShowFeedbackModal(true);
      return;
    }

    try {
      const userIds = checkboxesSelected.map(async item => {
        const response = await api.post('/user/delete', {
          userId: item.id,
          app: "nimda"
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

  // Handle import website
  const handleImportWebsite = (website) => {
    setSelectedWebsite(website);
    setShowImportModal(true);
  };

  const handleConfirmImport = async () => {
    try {
      const response = await api.post('/website/import', {
        websiteId: selectedWebsite.id,
        websiteName: selectedWebsite.Name,
        websiteUrl: selectedWebsite.StartingUrl
      });
      
      setFeedbackMessage("Sítio web e páginas importados com sucesso!");
      setShowImportModal(false);
      setSelectedWebsite(null);
      fetchData(); // Refresh the data
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erro ao importar sítio web. Tente novamente.";
      setFeedbackMessage(errorMsg);
    }
    setShowFeedbackModal(true);
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setSelectedWebsite(null);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
        <h1>Sítios Web do Utilizador {name}</h1>

      <div className="content bg-white">
      <h2>{t('WEBSITES_PAGE.LIST.subtitle_list')}</h2>
          <div className="d-flex gap-2 align-items-center mb-4">
            <span>{t('MISC.filter')}</span>
            <InputSearch
              darkTheme={theme}
              placeholder={t('MISC.filter') + ' utilizadores...'}
              label={t('MISC.filter') + ' utilizadores'}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

        <SortingTable
          darkTheme={theme}
          headers={websiteUsersHeaders}
          setDataList={setWebsitesData}
          dataList={filteredWebsites}
          columnsOptions={websiteUsersColumnsOptions(navigate, handleImportWebsite)}
          nextPage={() => null}
          caption={t( 'WEBSITES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          project=""
          setCheckboxesSelected={setCheckboxesSelected}
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
            "Última página"
          ]}
          nItemsPerPageTexts={[
            "Ver",           // see
            "por página",    // per_page
            "Selector de itens por página", // selectorAria
            "Navegação do seletor de itens por página" // selectorNav
          ]}
          itemsPaginationTexts={[
            " de ",    // of
            " itens "  // items
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

      <Modal
        isOpen={showImportModal}
        onRequestClose={handleCancelImport}
        title="Importar sítio Web"
      >
        <div>
          <p><strong>Sítio web:</strong> {selectedWebsite?.Name}</p>
          <p><strong>URL:</strong> {selectedWebsite?.StartingUrl}</p>
          
          <p style={{ marginTop: '16px' }}>
            O sítio Web "{selectedWebsite?.Name}" ({selectedWebsite?.StartingUrl}) já existe. 
            <br/> Vamos proceder à importação da amostra do MyMonitor no AMS.<br/> O processo inclui a 
            importação de todas as páginas e respetivas avaliações, sempre que estas sejam mais 
            recentes às existentes no AMS. As páginas que existam no AMS e que não constem da 
            amostra agora a importar não sofreram alterações.</p>
          <div className="d-flex gap-2 justify-content-end" style={{ marginTop: '24px' }}>
            <Button
              darkTheme={theme}
              text="Cancelar"
              className="btn-secondary"
              onClick={handleCancelImport}
            />
            <Button
              darkTheme={theme}
              text="Importar"
              className="btn-primary"
              onClick={handleConfirmImport}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WebsitesForUsers;
