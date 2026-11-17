import { useState, useEffect, useCallback } from "react";
import qs from "qs";
import { InputSearch, SortingTable, Button, Breadcrumb } from "@a12e/accessmonitor-ds";
import { Link, useParams } from "react-router";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/Modal.jsx";
import { directoriesHeadersCrawlDetails, columnsOptionsCrawlDetails, nameOfIcons, sortFieldsCrawlDetails } from "./table.config.jsx";
import { useServerSort, MAX_ITEMS_PER_PAGE } from "../../hooks/useServerSort";
import { api } from "../../config/api";
import { usePermissions } from "../../context/AuthContext";
import { evaluateWebsites } from "../../services/evaluations";
export default function DetailsCrawler() {
  const { t } = useTranslation();
  const { id, websiteId } = useParams();
  const { canEdit } = usePermissions();
  const [website, setWebsite] = useState({
    Name: "",
    StartingUrl: "",
  });
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/crawler">Crawlers</Link> },
    { title: "Importação de páginas para o sítio Web" },
  ];
  const { theme } = useTheme();
  const [data, setData] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const { sorts, onSortChange, sortHeaders } = useServerSort(sortFieldsCrawlDetails, () => setCurrentPage(1));

  const fetchPages = useCallback(async (page, limit, search) => {
    try {
      const queryObj = { pagination: { limit, page } };
      if (search) queryObj.filters = { searchTerm: search };
      if (sorts) queryObj.sorts = sorts;
      const query = qs.stringify(queryObj);
      const response = await api.get(`/discovery/websites/${websiteId}/crawler/${id}?${query}`);
      const { data: pages, meta } = response.data.data.data;
      setData(pages.map((page) => ({ id: page.id, Uri: page.url })));
      setTotalItems(meta?.totalItems ?? pages.length);
    } catch (error) {
      console.error("Error fetching crawler pages:", error);
    }
  }, [id, websiteId, sorts]);

  useEffect(() => {
    api.get(`/websites/${websiteId}`).then((res) => {
      const w = res.data?.data ?? res.data;
      setWebsite({ Name: w.title ?? w.baseUrl, StartingUrl: w.baseUrl });
    });
  }, [websiteId]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchPages(currentPage, itemsPerPage, searchTerm);
    }, 300);
    return () => clearTimeout(timeout);
  }, [currentPage, itemsPerPage, searchTerm, fetchPages]);

  const handleSearchChange = (e) => {
    const value = typeof e === "string" ? e : (e?.target?.value ?? "");
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleImport = async () => {
    if (!canEdit) return;
    const selectedItems = checkboxesSelected;
    try {
      const response = await api.post(`/discovery/websites/${websiteId}/crawler/${id}/pages`, {
        crawlerPageIds: selectedItems.map((item) => item.id),
      });
      console.log(response.status)
      if (response.status === 200 || response.status === 201) {

        await evaluateWebsites([websiteId]);
        setOpenModal(true);
        setCheckboxesSelected([]);
        setFeedbackMessage(
          "As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível."
        );
        await fetchPages(currentPage, itemsPerPage, searchTerm);
      } else {
        setFeedbackMessage("Erro inesperado ao importar");
        setOpenModal(true);
      }
    } catch (error) {
      console.error("Error importing pages:", error);
      setFeedbackMessage("Erro inesperado ao importar");
      setOpenModal(true);
    }
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>Importação de páginas para o sítio Web</h1>
      <div className="content bg-white">
        <p>Está a atuar sobre o sítio web:</p>
        <ul>
          <li>Sítio Web: {website.Name}</li>
          <li>URL inicial: {website.StartingUrl}</li>
          <li>
            Nº de Páginas na amostra: {totalItems}
          </li>
        </ul>
        <p>
          O robô encontrou a lista de páginas abaixo. Selecione as páginas que
          pretende importar.
        </p>
        <p>
          Nota: o processo de importação só vai importar os URLs que ainda não
          existem na amostra.
        </p>
        <div className="d-flex gap-2 align-items-center mb-3">
          <span>{t("MISC.filter")}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t("MISC.filter") + "..."}
            label={t("MISC.filter")}
            id="search"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>

        {canEdit && (
        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={"Importar"}
            className="btn-primary"
            onClick={handleImport}
            disabled={checkboxesSelected.length === 0}
          />
        </div>
        )}

        <SortingTable
          darkTheme={theme}
          headers={sortHeaders(directoriesHeadersCrawlDetails)}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptionsCrawlDetails}
          nextPage={() => null}
          caption="Listagem de páginas encontradas"
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
          onPageChange={(page) => setCurrentPage(page)}
          onItemsPerPageChange={(items) => { setItemsPerPage(items); setCurrentPage(1); }}
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
        title="Importação"
        onClose={() => setFeedbackMessage("")}
        isOpen={openModal}
      >
        <p>{feedbackMessage}</p>
        <Button
          darkTheme={theme}
          text={"Fechar"}
          className="btn-primary"
          onClick={() => setOpenModal(false)}
        />
      </Modal>
    </div>
  );
}
