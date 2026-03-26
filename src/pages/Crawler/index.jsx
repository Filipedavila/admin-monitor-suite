import React, { useState, useEffect, useMemo } from "react";
import { InputSearch, SortingTable, Button, Breadcrumb } from "ama-design-system";
import { Link, useNavigate } from "react-router";
import { useTheme } from '../../context/ThemeContext.jsx';
import { useTranslation } from 'react-i18next';
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons } from "./table.config.jsx";
import { api } from "../../config/api";
import moment from "moment";
import { Modal } from "../../components/Modal";

export default function CrawlerList() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [data, setData] = useState(dataRows);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Crawlers" },
  ];

  const fetchData = async () => {
    try {
      const response = await api.get('/crawler/all');
      setData(response.data.result.map(crawl => ({
        id: crawl.CrawlWebsiteId,
        url: crawl.StartingUrl,
        startDate: moment(crawl.Creation_Date).format('DD/MM/YYYY'),
        status: crawl.Done === 1 ? "Concluído" : "Em andamento",
        results: "N/A",
        websiteId: crawl.WebsiteId
      })));
    } catch (error) {
      console.error("Error fetching crawlers:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    if (checkboxesSelected.length === 0) {
      setFeedbackMessage("Por favor, selecione pelo menos um crawler para eliminar.");
      setShowFeedbackModal(true);
      return;
    }

    try {
      const crawlWebsiteIds = checkboxesSelected.map(item => item.id);
      const response = await api.post('/crawler/deleteBulk', {
        crawlWebsiteIds: crawlWebsiteIds
      });

      if (response.status === 200 || response.status === 201) {
        setFeedbackMessage(`${crawlWebsiteIds.length} crawler(s) eliminado(s) com sucesso!`);
        setCheckboxesSelected([]);
        setSearch("");
        await fetchData();
      } else {
        setFeedbackMessage("Erro ao eliminar crawlers. Tente novamente.");
      }
    } catch (error) {
      console.error("Error deleting crawlers:", error);
      setFeedbackMessage("Erro ao eliminar crawlers. Tente novamente.");
    }
    setShowFeedbackModal(true);
  };

  const filteredData = useMemo(() => {
    if (!search.trim()) return data;
    const query = search.toLowerCase();
    const fieldsToSearch = ["url", "startDate", "status"]; // pesquisa por array de campos
    return data.filter((row) =>
      fieldsToSearch.some((key) => String(row[key] ?? "").toLowerCase().includes(query))
    );
  }, [data, search]);

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
        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={t('CRAWLER_PAGE.LIST.table.delete_crawlers')}
            className="btn-primary"
            onClick={handleDeleteCrawlers}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={filteredData}
          columnsOptions={columnsOptions(navigate)}
          nextPage={() => null}
          caption={t('CRAWLER_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
          pagination={true}
          serverSidePagination={false}
          totalItems={filteredData.length}
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
          paginationOptions={[10, 25, 50, 100].filter(v => v <= filteredData.length || v === 10).concat(filteredData.length > 100 ? [filteredData.length] : []).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b)}
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