import React, { useEffect, useState, useMemo } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb, RadioGroup } from "@a12e/accessmonitor-ds";
import { useTheme } from '../../context/ThemeContext';
import "./style.users.css";
import { directoriesHeaders, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import { setRootNavigationContext } from "../../utils/navigation";

const DirectoriesList = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const [allDirectories, setAllDirectories] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [radioValue, setRadioValue] = useState(1);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);
  
  const fetchData = async () => {
    const response = await api.get('/directory/all');
    setAllDirectories(response.data.result.map(item => ({
      id: item.DirectoryId,
      Name: item.Name,
      Show_in_Observatory: item.Show_in_Observatory ? "Sim" : "Não",
      edit: t('USERS_PAGE.LIST.table.edit_label'),
    })));
  };

  useEffect(() => {

    fetchData();
  }, []);

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Diretórios" },
  ];

  useEffect(() => {
    localStorage.setItem('openSubmenu', JSON.stringify({ id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" }));
    localStorage.setItem('activeMenuItem', JSON.stringify({ id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" }));
    
    // Clear root context when viewing directory list
    setRootNavigationContext(null);
  }, []);

  // Filter directories based on search term
  const filteredDirectories = useMemo(() => {
    if (!searchTerm.trim()) {
      return allDirectories;
    }
    return allDirectories.filter(directory =>
      directory.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allDirectories, searchTerm]);

  const totalItems = filteredDirectories.length;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredDirectories.slice(start, end);
  }, [filteredDirectories, currentPage, itemsPerPage]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDeleteDirectories = async () => {
    const directoriesId = checkboxesSelected.map(item => item.id);
    const response = await api.post(`/directory/deleteBulk`, {
      directoriesId: directoriesId
    });
    if (response.status === 201 || response.status === 200) {
      setFeedbackMessage("Diretórios eliminados com sucesso!");
      setShowFeedbackModal(true);
      await fetchData();
      setCheckboxesSelected([]);
      setSearchTerm("");
      setAllDirectories([])
      setCurrentPage(1);
    
    
    }
  }

  const handleDeleteDirectoriesPage = async () => {

    const response = await api.post(`/directory/pages/deleteBulk`, {
      directoriesId: checkboxesSelected
    });
    if (response.status === 200) {
      setAllDirectories(allDirectories.filter(directory => !checkboxesSelected.includes(directory.DirectoryId)));
      setCheckboxesSelected([]);
      setSearchTerm("");
  
    }
  };

  const handleReevaluatePages = async () => {
    const directoriesId = checkboxesSelected.map(item => item.id);
    const reEvaluate = radioValue === 1 ? "all" : "observatory";
    try {
      const response = await api.post(`/directory/reEvaluate`, {
        directoriesId: directoriesId,
        option: reEvaluate
      });
      if (response.status === 201 || response.status === 200) {
        setShowModal(false);
        setFeedbackMessage("As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível.");
        setShowFeedbackModal(true);
      } else {
        setShowModal(false);
        setFeedbackMessage("Ocorreu um erro ao iniciar a reavaliação.");
        setShowFeedbackModal(true);
      }
    } catch (error) {
      setShowModal(false);
      setFeedbackMessage("Ocorreu um erro ao iniciar a reavaliação.");
      setShowFeedbackModal(true);
    }
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
      <h1>{t('DIRECTORIES_PAGE.LIST.title_list')}</h1>
      <p>Abaixo encontra a listagem de todos os diretórios registados no AdminMonitorSuite, num total de {totalItems} diretórios.</p>
      <div className="content bg-white">
        <h2>{t('DIRECTORIES_PAGE.LIST.subtitle_list')}</h2>
        <div className="d-flex  gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + ' diretórios...'}
            label={t('MISC.filter') + ' diretórios'}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.re_evaluate_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => setShowModal(true)}
            disabled={checkboxesSelected.length === 0}
          />
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.delete_page')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteDirectoriesPage}
            disabled={checkboxesSelected.length === 0}
          />
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.delete_directories')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteDirectories}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setAllDirectories}
          dataList={paginatedData}
          columnsOptions={columnsOptions(navigate)}
          nextPage={() => null}
          caption={t('DIRECTORIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          project={""}
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
          rowKey="DirectoryId"
        />
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          title={t('DIRECTORIES_PAGE.LIST.re_evaluate_pages')}
        >
          <p>Escolha que páginas quer reavaliar</p>
          <RadioGroup
                            darkTheme={theme}
                            data={[
                                {
                                    id: '1',
                                    name:"Todas as páginas"
                                },
                                {
                                    id: '2',
                                    name: "Apenas as páginas do observatório"
                                }
                            ]}
                            inline
                            onChange={(value) => setRadioValue(value)}
                            value={radioValue}
                            name="format"
                        />

                        <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.re_evaluate_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleReevaluatePages}
          />
        </Modal>
        <Modal
          isOpen={showFeedbackModal}
          onRequestClose={() => setShowFeedbackModal(false)}
          title="Reavaliação"
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

export default DirectoriesList;