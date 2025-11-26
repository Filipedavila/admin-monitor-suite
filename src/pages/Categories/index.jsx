import React, { useState, useEffect, useMemo } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb, RadioGroup } from "ama-design-system";
import "./style.users.css";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { categoriesHeaders, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { useTranslation } from 'react-i18next';
import { api } from "../../config/api";
import { Modal } from "../../components/Modal";
import CrawlingModal from "../../components/CrawlingModal";
import { setRootNavigationContext } from "../../utils/navigation";

const CategoriesList = () => {
  const { theme } = useTheme();
  const [allCategories, setAllCategories] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showCrawlingModal, setShowCrawlingModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [radioValue, setRadioValue] = useState(1);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Categorias" }
  ];
  
  useEffect(() => {
    // Clear root context when viewing category list
    setRootNavigationContext(null);
  }, []);
  const fetchData = async () => {
    const response = await api.get('/tag/all');
    setAllCategories(response.data.result.map(item => ({
      id: item.TagId,
      Name: item.Name,
      Websites: item.Websites,
      edit: t('USERS_PAGE.LIST.table.edit_label'),
    })));
  };
  useEffect(() => {

    fetchData();
  }, []);

  // Filter categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) {
      return allCategories;
    }
    return allCategories.filter(category =>
      category.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allCategories, searchTerm]);

  const totalItems = filteredCategories.length;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredCategories.slice(start, end);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const handlePageChange = (page) => setCurrentPage(page);
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleDeletePagesCategories = async () => {
    const categoriesId = checkboxesSelected.map(item => item.id);
    const response = await api.post(`/tag/pages/deleteBulk`, {
      tagsId: categoriesId
    });
    if (response.status === 201 || response.status === 200) {
      setFeedbackMessage("Páginas eliminadas com sucesso!");
      setShowFeedbackModal(true);
      setCheckboxesSelected([]);
      setSearchTerm("");
    } else {
      setFeedbackMessage("Ocorreu um erro ao eliminar as páginas.");
      setShowFeedbackModal(true);
    }
  }

  // Delete selected categories
  const handleDeleteCategories = async () => {
    const categoriesId = checkboxesSelected.map(item => item.id);
    const response = await api.post(`/tag/deleteBulk`, {
      tagsId: categoriesId
    });
    if (response.status === 201 || response.status === 200) {
      setFeedbackMessage("Categorias eliminadas com sucesso!");
      setShowFeedbackModal(true);
      setCheckboxesSelected([]);
      setSearchTerm("");
      await fetchData();
    }
  };

  // Re-evaluate selected categories
  const handleReevaluateCategories = async () => {
    const categoriesId = checkboxesSelected.map(item => item.id);
    const reEvaluate = radioValue === 1 ? "all" : "observatory";
    try {
      const response = await api.post(`/tag/reEvaluate`, {
        tagsId: categoriesId,
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

  // Handle crawling for categories
  const handleCrawlingCategories = async ({ maxDepth, maxPages, waitJS, selectedItems }) => {
    if (selectedItems.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos uma categoria para fazer crawling.");
      setShowFeedbackModal(true);
      return;
    }
    
    const categoriesId = selectedItems.map(item => item.id);
    
    try {
      const response = await api.post('/crawler/crawl/categories', {
        categories: categoriesId,
        maxDepth: maxDepth,
        maxPages: maxPages,
        waitJS: waitJS ? 1 : 0
      });
      
      if (response.status === 201 || response.status === 200) {
        setFeedbackMessage("O crawling foi iniciado com sucesso! O processo será executado em segundo plano.");
        setCheckboxesSelected([]);
        setShowCrawlingModal(false);
        await fetchData();
      }
    } catch (error) {
      setFeedbackMessage("Erro ao iniciar o crawling. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
      <h1>{t('CATEGORIES_PAGE.LIST.title')}</h1>
      <p>Abaixo encontra a listagem de todas as categorias registadas no AdminMonitorSuite, num total de {totalItems} categorias.</p>
      <div className="content bg-white bg-white">
        <h2>{t('CATEGORIES_PAGE.LIST.subtitle')}</h2>
        <div className="d-flex gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + ' categorias...'}
            label={t('MISC.filter') + ' categorias'}
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.re_evaluate_tags')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => setShowModal(true)}
            disabled={checkboxesSelected.length === 0}
          />
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.crawler')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => setShowCrawlingModal(true)}
            disabled={checkboxesSelected.length === 0}
          />
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.delete_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeletePagesCategories}
            disabled={checkboxesSelected.length === 0}
          />
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.delete_tags')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteCategories}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={categoriesHeaders}
          setDataList={setAllCategories}
          dataList={paginatedData}
          columnsOptions={columnsOptions(navigate)}
          nextPage={() => null}
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
          caption={t('CATEGORIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={[
            "Primeira página",
            "Página anterior",
            "Página seguinte",
            "Última página"
          ]}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          pagination={true}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          rowKey="id"
        />
      </div>
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        title={t('CATEGORIES_PAGE.LIST.re_evaluate_tags')}
      >
        <p>Escolha que páginas quer reavaliar</p>
        <RadioGroup
          darkTheme={theme}
          data={[
            {
              id: '1',
              name: "Todas as páginas"
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
          text={t('CATEGORIES_PAGE.LIST.re_evaluate_tags')}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={handleReevaluateCategories}
        />
      </Modal>
      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title="Categorias"
      >
        <p>{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text="OK"
          className="btn-primary"
          onClick={() => setShowFeedbackModal(false)}
        />
      </Modal>
      <CrawlingModal
        isOpen={showCrawlingModal}
        onRequestClose={() => setShowCrawlingModal(false)}
        onSubmit={handleCrawlingCategories}
        theme={theme}
        selectedItems={checkboxesSelected}
        itemType="categories"
      />
    </div>
  );
};

export default CategoriesList;