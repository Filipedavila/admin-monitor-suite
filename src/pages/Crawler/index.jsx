import { useState, useEffect, useCallback, useMemo } from "react";
import qs from "qs";
import { InputSearch, SortingTable, Button, Breadcrumb } from "@a12e/accessmonitor-ds";
import { Link, useNavigate } from "react-router";
import { useTheme } from '../../context/ThemeContext.jsx';
import { useTranslation } from 'react-i18next';
import { directoriesHeaders, columnsOptions, nameOfIcons, sortFields } from "./table.config.jsx";
import { useServerSort, MAX_ITEMS_PER_PAGE } from "../../hooks/useServerSort";
import { api } from "../../config/api";
import moment from "moment";
import { Modal } from "../../components/Modal";
import { usePermissions } from "../../context/AuthContext";
import { useCrawlerState } from "../../utils/crawlerEvents";
import { crawlerStatusHtml } from "../../components/EvaluationStatus";

export default function CrawlerList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { canDelete } = usePermissions();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { crawlers: liveCrawlers, changeTick } = useCrawlerState();
  const { sorts, onSortChange, sortHeaders } = useServerSort(sortFields, () => setCurrentPage(1));

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Crawlers" },
  ];

  const fetchData = useCallback(async (page, limit, searchTerm) => {
    try {
      const queryObj = { pagination: { limit, page } };
      if (searchTerm) queryObj.filters = { searchTerm };
      if (sorts) queryObj.sorts = sorts;
      const query = qs.stringify(queryObj);
      const response = await api.get(`/discovery?${query}`);
      const { data: crawlers, pagination } = response.data;
      setData(crawlers.map(crawl => ({
        id: crawl.id,
        url: crawl.baseUrl,
        startDate: moment(crawl.createdAt).format('DD/MM/YYYY'),
        status: crawl.status ?? (crawl.isDone ? "COMPLETED" : "PENDING"),
        results: crawl.pagesCount,
        websiteId: crawl.websiteId
      })));
      setTotalItems(pagination?.totalItems ?? crawlers.length);
    } catch (error) {
      console.error("Error fetching crawlers:", error);
    }
  }, [sorts]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchData(currentPage, itemsPerPage, search);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, itemsPerPage, search, fetchData, changeTick]);

  const rows = useMemo(
    () => data.map((row) => ({ ...row, status: crawlerStatusHtml(row.status, liveCrawlers.get(row.id)) })),
    [data, liveCrawlers]
  );

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  const handleDeleteCrawlers = async () => {
    if (!canDelete) return;
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um crawler para eliminar.");
      setShowFeedbackModal(true);
      return;
    }

    try {
      const crawlWebsiteIds = checkboxesSelected.map(item => item.id);
      const response = await api.delete('/discovery', {
        data: { ids: crawlWebsiteIds }
      });

      if (response.status === 204) {
        setFeedbackMessage(`${crawlWebsiteIds.length} crawler(s) eliminado(s) com sucesso!`);
        setCheckboxesSelected([]);
        setSearch("");
        setCurrentPage(1);
        await fetchData(1, itemsPerPage, "");
      } else {
        setFeedbackMessage("Erro ao eliminar crawlers. Tente novamente.");
      }
    } catch (error) {
      console.error("Error deleting crawlers:", error);
      setFeedbackMessage("Erro ao eliminar crawlers. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t('CRAWLER_PAGE.LIST.title')}</h1>
      <div className="content bg-white">
        <h2>{t('CRAWLER_PAGE.LIST.table.title')}</h2>
        <div className="d-flex gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + '...'}
            label={t('MISC.filter')}
            id="search"
            value={search}
            onChange={handleSearchChange}
          />
        </div>
        {canDelete && (
        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={t('CRAWLER_PAGE.LIST.table.delete_crawlers')}
            className="btn-primary"
            onClick={handleDeleteCrawlers}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        )}
        
        <SortingTable
          darkTheme={theme}
          headers={sortHeaders(directoriesHeaders)}
          setDataList={setData}
          dataList={rows}
          columnsOptions={columnsOptions(navigate, setCheckboxesSelected)}
          nextPage={() => null}
          caption={t('CRAWLER_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
          pagination={true}
          serverSidePagination={true}
          onSortChange={onSortChange}
          maxItemsPerPage={MAX_ITEMS_PER_PAGE}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          paginationButtonsTexts={[
            "Primeira página",
            "Página anterior",
            "Página seguinte",
            "Última página"
          ]}
          nItemsPerPageTexts={[
            "Ver",
            "por página",
            "Selector de itens por página",
            "Navegação do seletor de itens por página"
          ]}
          itemsPaginationTexts={[
            " de ",
            " itens "
          ]}
          rowKey="id"
        />
      </div>

      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title="Apagar Crawlers"
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
} 