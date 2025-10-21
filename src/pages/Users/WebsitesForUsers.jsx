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
  const [newWebsiteName, setNewWebsiteName] = useState("");

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
    { title: "Utilizador: " + name }
  ];

  const fetchData = async () => {
    const response = await api.get(`/user/websites/${name}`);
    setWebsitesData(response.data.result.map(item => ({
      Username: name,
      id: item.WebsiteId,
      Name: item.Name,
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
    setNewWebsiteName(website.Name);
    setShowImportModal(true);
  };

  const handleConfirmImport = async () => {
    if (!newWebsiteName.trim()) {
      setFeedbackMessage("Por favor, insira um nome para o sítio web.");
      setShowFeedbackModal(true);
      return;
    }

    try {
      const response = await api.post('/website/import', {
        websiteId: selectedWebsite.id,
        websiteName: newWebsiteName
      });
      
      setFeedbackMessage("Sítio web importado com sucesso!");
      setShowImportModal(false);
      setNewWebsiteName("");
      setSelectedWebsite(null);
      fetchData(); // Refresh the data
    } catch (error) {
      setFeedbackMessage("Erro ao importar sítio web. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const handleCancelImport = () => {
    setShowImportModal(false);
    setNewWebsiteName("");
    setSelectedWebsite(null);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
        <h1> Utilizador: {name}</h1>

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
        title="Importar Sítio Web"
      >
        <div>
          <p><strong>Importar o sítio web {selectedWebsite?.Name}</strong></p>
          <p><strong>Atenção!</strong></p>
          <p>Esta operação irá importar o sítio web e o seu domínio () associado, bem como todas as suas páginas.</p>
          <p>Se pretender importar este domínio para outro sítio web existente, crie primeiro esse domínio no respetivo sítio web.</p>
          <p><strong>Esta ação não pode ser revertida!</strong></p>
          <p><strong>Já existe um sítio web com este nome!</strong></p>
          <p>Por favor, insira um novo nome para o sítio web a importar:</p>
          
          <div className="mb-3">
            <input
              type="text"
              className="form-control"
              value={newWebsiteName}
              onChange={(e) => setNewWebsiteName(e.target.value)}
              placeholder="Nome do sítio web"
            />
          </div>
          
          <div className="d-flex gap-2 justify-content-end">
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
