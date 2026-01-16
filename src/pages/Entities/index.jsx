import React, { useState, useEffect } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb, RadioGroup } from "ama-design-system";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal } from "../../components/Modal";
import { useTheme } from '../../context/ThemeContext';
import "./style.users.css";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import moment from "moment";
import { setRootNavigationContext } from "../../utils/navigation";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";

const EntitiesList = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [radioValue, setRadioValue] = useState(1);
  const navigate = useNavigate();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

  useEffect(() => {
    setBreadcrumbs([
      { children: <Link to="/dashboard/home">Início</Link> },
      { title: "Entidades" }
    ]);
    
    // Clear root context when viewing entity list
    setRootNavigationContext(null);
  }, []);

  const handleSearchChange = (value) => {
    setSearch(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  const fetchData = async (searchValue, page, perPage) => {
    // Use passed parameters to ensure consistency
    const searchParam = searchValue !== undefined ? searchValue : search;
    const pageParam = page !== undefined ? page : currentPage;
    const perPageParam = perPage !== undefined ? perPage : itemsPerPage;
    
    const responseTotal = await api.get(`/entity/all/count/search=${searchParam}`);
    setTotalItems(Number(responseTotal.data.result));
    const offset = pageParam - 1;
    const response = await api.get(`/entity/all/${perPageParam}/${offset}/sort=/direction=/search=${searchParam}`);
    setData(response.data.result.map(item => ({
      id: item.EntityId,
      Short_Name: item.Short_Name,
      Long_Name: item.Long_Name,
      Creation_at: moment(item.Creation_Date).format('DD/MM/YYYY'),
      Websites: item.Websites,
      edit: t('USERS_PAGE.LIST.table.edit_label'),
    })));
  };

  // Fetch total count and current page data
  useEffect(() => {
    fetchData(search, currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage, search]);

  // Handle page change
  const handlePageChange = (page) => setCurrentPage(page);

  // Handle items per page change
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1); // Reset to first page
  };

  // Delete selected entities
  const handleDeleteEntities = async () => {
    const entitiesId = checkboxesSelected.map(item => item.id);
    const response = await api.post(`/entity/deleteBulk`, {
      entitiesId: entitiesId
    });
    if (response.status === 201 || response.status === 200) {
      setFeedbackMessage("Entidades eliminadas com sucesso!");
      setShowFeedbackModal(true);
      setCheckboxesSelected([]);
      setSearch("");
      await fetchData("", 1, itemsPerPage);
    }
  };

  // Delete pages of selected entities
  const handleDeletePagesEntities = async () => {
    const entitiesId = checkboxesSelected.map(item => item.id);
    const response = await api.post(`/entity/pages/deleteBulk`, {
      entitiesId: entitiesId
    });
    if (response.status === 201 || response.status === 200) {
      setFeedbackMessage("Páginas eliminadas com sucesso!");
      setShowFeedbackModal(true);
      setCheckboxesSelected([]);
      setSearch("");
      await fetchData("", 1, itemsPerPage);
    } else {
      setFeedbackMessage("Ocorreu um erro ao eliminar as páginas.");
      setShowFeedbackModal(true);
    }
  };

  // Re-evaluate selected entities
  const handleReevaluateEntities = async () => {
    const entitiesId = checkboxesSelected.map(item => item.id);
    const reEvaluate = radioValue === 1 ? "all" : "observatory";
    try {
      const response = await api.post(`/entity/reEvaluate`, {
        entitiesId: entitiesId,
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
      <h2>{t('ENTITIES_PAGE.LIST.title')}</h2>
      <p>
        Abaixo encontra a listagem de todas as entidades registadas no AdminMonitorSuite, num total de {totalItems} entidades.
      </p>
      <div className="content bg-white">
        <h2>{t('ENTITIES_PAGE.LIST.subtitle')}</h2>
        <div className="d-flex  gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + '...'}
            label={t('MISC.filter')}
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={t('ENTITIES_PAGE.LIST.re_evaluate_entities')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => setShowModal(true)}
            disabled={checkboxesSelected.length === 0}
          />
          <Button
            darkTheme={theme}
            text={t('ENTITIES_PAGE.LIST.delete_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeletePagesEntities}
            disabled={checkboxesSelected.length === 0}
          />
          <Button
            darkTheme={theme}
            text={t('ENTITIES_PAGE.LIST.delete_entities')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeleteEntities}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions(navigate)}
          nextPage={() => null}
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
          pagination={true}
          serverSidePagination={true}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
          rowKey="id"
        />
        <Modal
          isOpen={showModal}
          onRequestClose={() => setShowModal(false)}
          title={t('ENTITIES_PAGE.LIST.re_evaluate_entities')}
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
            text={t('ENTITIES_PAGE.LIST.re_evaluate_entities')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleReevaluateEntities}
          />
        </Modal>
        <Modal
          isOpen={showFeedbackModal}
          onRequestClose={() => setShowFeedbackModal(false)}
          title="Entidades"
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

export default EntitiesList;