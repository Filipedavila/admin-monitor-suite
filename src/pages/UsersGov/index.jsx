import React, { useState, useEffect, useMemo } from "react";
import {
  Button,
  InputSearch,
  SortingTable,
  Breadcrumb,
} from "ama-design-system";
import "./style.users.css";
import {
  dataHeaders,
  nameOfIcons,
  paginationButtonsTexts,
} from "./table.config";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import moment from "moment";
import { Modal } from "../../components/Modal";

const UserGovList = () => {
  const location = useLocation();
  const [allUsersGov, setAllUsersGov] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
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

  const fetchData = async () => {
    const response = await api.get('/gov-user/all');
    setAllUsersGov(response.data.result.map(item => ({
      id: item.id,
      name: item.name,
      ccNumber: item.ccNumber,
      registerDate: moment(item.registerDate).format('DD/MM/YYYY HH:mm:ss'),
      lastLogin: moment(item.lastLogin).format('DD/MM/YYYY HH:mm:ss'),
      edit: "Editar",
    })));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  
  const { theme } = useTheme();
  const { t } = useTranslation();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Utilizadores Gov" },
  ];
  const navigate = useNavigate();
  // Filter government users based on search term
  const filteredUsersGov = useMemo(() => {
    if (!searchTerm.trim()) {
      return allUsersGov;
    }
    return allUsersGov.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allUsersGov, searchTerm]);

  const totalItems = filteredUsersGov.length;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredUsersGov.slice(start, end);
  }, [filteredUsersGov, currentPage, itemsPerPage]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const columnsOptions = {
    id: { type: "Checkbox", center: true, bold: false, decimalPlace: false },
    name: { type: "Text", center: true, bold: false, decimalPlace: false, isCheckboxLabel: true },
    ccNumber: { type: "Text", center: true, bold: false, decimalPlace: false },
    registerDate: { type: "Text", center: true, bold: false, decimalPlace: false },
    lastLogin: { type: "Text", center: true, bold: false, decimalPlace: false },
    edit: { type: "Button", text:t('USERS_PAGE.LIST.table.edit_label'), onClick: (row)=>{ 
      navigate(`/dashboard/usersgov/edit/${row.id}`)
    }, center: true, bold: false, decimalPlace: false },
  };
  
  // Handle delete government users
  const handleDeleteUsersGov = async () => {
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um utilizador gov para eliminar.");
      setShowFeedbackModal(true);
      return;
    }

    try {
      await Promise.all(checkboxesSelected.map(async item => {
        const response = await api.post('/gov-user/delete', {
          id: item.id
        });
        return response.data.result.UserId;
      }));

      setFeedbackMessage("Utilizadores gov eliminados com sucesso!");
      setCheckboxesSelected([]);
      setSearchTerm("");
      fetchData();
      
    } catch (error) {
      setFeedbackMessage("Erro ao eliminar utilizadores gov. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const onSubmit = (formData) => {
    console.log("User data:", formData);
    // Lógica de criação de utilizador, se for o caso
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
      <h1>{t('GOV_USERS_PAGE.LIST.title')}</h1>
      <p>
        {t('GOV_USERS_PAGE.LIST.subtitle')} num total de {totalItems} utilizadores.
      </p>

      <div className="content bg-white">
        <h2>{t('GOV_USERS_PAGE.LIST.title')}</h2>

          <div className="d-flex  gap-2 align-items-center mb-3">
            <span>{t('MISC.filter')}</span>
            <InputSearch
              darkTheme={theme}
              placeholder={t('MISC.filter') + ' utilizadores gov...'}
              label={t('MISC.filter') + ' utilizadores gov'}
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>

          <Button
            darkTheme={theme}
            text={t('GOV_USERS_PAGE.LIST.delete_users')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary mb-3"
            onClick={handleDeleteUsersGov}
            disabled={checkboxesSelected.length === 0}
          />

        <SortingTable
          darkTheme={theme}
          headers={dataHeaders}
          setDataList={setAllUsersGov}
          dataList={paginatedData}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={t('GOV_USERS_PAGE.LIST.table.title')}
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
        title="Utilizadores Gov"
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

export default UserGovList;
