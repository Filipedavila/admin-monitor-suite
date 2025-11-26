import React, { useState, useEffect } from "react";
import { InputSearch, Button, Breadcrumb } from "ama-design-system";
import { Link, useParams } from "react-router";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useTranslation } from "react-i18next";
import { Modal } from "../../components/Modal.jsx";
// Removed unused table config imports since we're using native table
import { api } from "../../config/api";
import moment from "moment";
export default function DetailsCrawler() {
  const { t } = useTranslation();
  const { id, websiteId } = useParams();
  const [website, setWebsite] = useState({
    Name: "",
    StartingUrl: "",
    numberOfPages: 0,
  });
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/crawler">Crawlers</Link> },
    { title: "Importação de páginas para o sítio Web" },
  ];
  useEffect(() => {
    const fetchData = async () => {
      const response = await api.get(`/crawler/getByCrawlWebsiteID/${id}`);
      const responseWebsite = await api.get(`/website/info/${websiteId}`);
      setWebsite(responseWebsite.data.result);
      setPageNumber(response.data.result.length);
      setData(
        response.data.result.map((crawl) => ({
          Uri: crawl.Uri,
          Import: false, // Initialize as unchecked
        }))
      );
    };
    fetchData();
  }, []);
  const { theme } = useTheme();
  const [data, setData] = useState([
    {
      Observatory: false,
      Uri: "",
      Import: false,
    },
  ]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageNumber, setPageNumber] = useState(1);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  // Filter data based on search term
  const filteredData = data.filter((item) =>
    item.Uri.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination calculations
  const totalItems = filteredData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Handle checkbox changes
  const handleCheckboxChange = (paginatedIndex, field, value) => {
    const actualItem = paginatedData[paginatedIndex];
    const actualIndex = data.findIndex((item) => item.Uri === actualItem.Uri);
    const newData = [...data];
    newData[actualIndex][field] = value;
    setData(newData);
  };

  // Handle select all functionality for current page
  const handleSelectAll = (field) => {
    const allPaginatedSelected = paginatedData.every((item) => item[field]);
    const newData = data.map((item) => {
      // Only update items that are visible in current page
      const isInPaginatedData = paginatedData.some(
        (paginatedItem) => paginatedItem.Uri === item.Uri
      );
      if (isInPaginatedData) {
        return {
          ...item,
          [field]: !allPaginatedSelected,
        };
      }
      return item;
    });
    setData(newData);
  };

  // Handle select all for all filtered items
  const handleSelectAllFiltered = (field) => {
    const allFilteredSelected = filteredData.every((item) => item[field]);
    const newData = data.map((item) => {
      const isInFilteredData = filteredData.some(
        (filteredItem) => filteredItem.Uri === item.Uri
      );
      if (isInFilteredData) {
        return {
          ...item,
          [field]: !allFilteredSelected,
        };
      }
      return item;
    });
    setData(newData);
  };
  const handleImport = async () => {
    const response = await api.post(`page/add`, {
      observatory: JSON.stringify(data.map((item) => item.Uri)),
      uris: JSON.stringify(data.map((item) => item.Uri)),
      websiteId: websiteId,
    });

    if (response.status === 200 || response.status === 201) {
      setOpenModal(true);
      setFeedbackMessage(
        "As páginas irão ser avaliadas em segundo plano, e a sua informação estará disponível assim que possível."
      );
    } else {
      setFeedbackMessage("Erro inesperado ao importar");
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
            Nº de Páginas na amostra: {pageNumber}(nº de páginas que existem
            atualmente no sítio Web)
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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={"Importar"}
            className="btn-primary"
            onClick={handleImport}
            disabled={
              data.length === 0 || data.every((item) => item.Import === false)
            }
          />
        </div>

        <div className="ama sorting_table_responsive">
          <table
            className={`table sorting_table`}
            style={{ marginTop: "1rem", tableLayout: "fixed" }}
          >
            <caption>Listagem de páginas encontradas</caption>
            <thead className={theme === "dark" ? "thead-dark" : "thead-light"}>
              <tr>
                <th
                  scope="col"
                  className="checkbox text-center"
                  style={{ width: "50px", padding: "0.5rem" }}
                >
                  <label htmlFor="checkbox_all_import">
                    <span className="visually-hidden">Selecionar registo</span>
                  </label>
                  <input
                    aria-description="todos os registos"
                    type="checkbox"
                    id="checkbox_all_import"
                    className="form-check-input"
                    checked={
                      paginatedData.length > 0 &&
                      paginatedData.every((item) => item.Import)
                    }
                    onChange={() => handleSelectAll("Import")}
                    style={{ padding: "8px", border: "1px solid grey" }}
                  />
                </th>
                <th scope="col">Páginas</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((row, index) => {
                  const checkboxId = `checkbox_${startIndex + index}`;
                  return (
                    <tr key={index}>
                      <td
                        className="text-center ama-typography-body"
                        style={{ padding: "0.5rem" }}
                      >
                        <input
                          type="checkbox"
                          id={checkboxId}
                          name={`${startIndex + index}`}
                          className="form-check-input"
                          checked={row.Import || false}
                          style={{ padding: "8px", border: "1px solid grey" }}
                          onChange={(e) =>
                            handleCheckboxChange(
                              index,
                              "Import",
                              e.target.checked
                            )
                          }
                        />
                      </td>
                      <td
                        className="ama-typography-body"
                        style={{ wordBreak: "break-all" }}
                      >
                        <label htmlFor={checkboxId}>
                          <a
                            href={row.Uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-none"
                          >
                            {row.Uri}
                          </a>
                        </label>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" className="text-center py-4">
                    {searchTerm
                      ? "Nenhuma página encontrada para o termo pesquisado."
                      : "Nenhuma página disponível."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Total items and pagination info */}
          <div className="d-flex justify-content-between align-items-center mt-3 mb-3 pagination">
            <div>
              {totalItems > 0 && (
                <span className="ms-3">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, totalItems)}{" "}
                  de {totalItems} páginas
                </span>
              )}
            </div>
            {totalItems > itemsPerPage && (
              <div className="d-flex align-items-center gap-2">
                <span>Páginas por página: {itemsPerPage}</span>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center align-items-center mt-3 pagination_section">
              <div className="me-3">
                <span>
                  Página {currentPage} de {totalPages}
                </span>
              </div>
              <select
                aria-label={t("MISC.itemsPerPage")}
                className="selection"
                name="itemsPerPage"
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                {[10, 20, 50, 100].map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <nav aria-label="Navegação da página">
                <ul className="pagination mb-0">
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      aria-label="Primeira página"
                    >
                      «
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === 1 ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      aria-label="Página anterior"
                    >
                      ‹
                    </button>
                  </li>

                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      aria-label="Próxima página"
                    >
                      ›
                    </button>
                  </li>
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(totalPages)}
                      disabled={currentPage === totalPages}
                      aria-label="Última página"
                    >
                      »
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          )}
        </div>
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
