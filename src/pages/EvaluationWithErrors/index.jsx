import React, { useState, useEffect } from "react";
import "./style.users.css";
import { useNavigate, useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Breadcrumb, Button, InputSearch } from "@a12e/accessmonitor-ds";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import { isRequestSuccessful } from "../../utils/apiHelpers.js";
import moment from "moment";
import { Modal } from "../../components/Modal";

import { useTheme } from '../../context/ThemeContext';
import { directoriesHeaders, columnsOptions, nameOfIcons, paginationButtonsTexts, nItemsPerPageText, itemsPaginationText, dataRows } from './table.config';
import { SortingTable } from "@a12e/accessmonitor-ds";

const EvaluationWithErrors = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const theme = useTheme();
  const navigate = useNavigate();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    {
      title: "Páginas com erros",
    },
  ];

  const handleSearchChange = (value) => {
    setSearch(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  const { type } = useParams();
  // Fetch total count and current page data
  const fetchData = async () => {
    const url = type === "AMS" ? "/page/evaluationList/error" : "/page/evaluationList/myMonitor/error ";
    const response = await api.get(url); 
    setData(response.data.result.map(item => ({
      id: item.EvaluationListId,
      Url: item.Url,
      Error: item.Error,
      CreatedAt: moment(item.CreatedAt).format('DD/MM/YYYY'),
      PageId: item.PageId,
    })));
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Handle page change
  const handlePageChange = (page) => setCurrentPage(page);

  // Handle items per page change
  const handleItemsPerPageChange = (n) => {
        setItemsPerPage(n);
        setCurrentPage(1); // Reset to first page
    };

  const handleReEvaluate = async () => {
    const pagesUrls = checkboxesSelected.map(item => item.Url);
    const response = await api.post("/page/reEvaluateMulti", {
      pages: pagesUrls,
    })
    if (response.status === 200 || response.status === 201) {
      setFeedbackMessage("As páginas que selecionou estão a ser reavaliadas pelo sistema. Pode fechar a janela e prosseguir o seu trabalho.!");
      await fetchData();
      setCheckboxesSelected([]);
      setShowFeedbackModal(true);
    }
    else{
      setFeedbackMessage("Erro ao re-avaliar páginas!");
      setCheckboxesSelected([]);
      setShowFeedbackModal(true);
    }
  }

  const handleRemoveFromList = async () => {
    const pagesIds = checkboxesSelected.map(item => item.id);
    const response = await api.post("/page/evaluationList/error/delete", {
      pages: pagesIds,
    })
    if (response.status === 200 || response.status === 201) {
      setFeedbackMessage("Páginas removidas da lista com sucesso!");
      await fetchData();
      setCheckboxesSelected([]);
      setShowFeedbackModal(true);
    }
    else {
      setFeedbackMessage("Erro ao remover páginas da lista!");
      setCheckboxesSelected([]);
      setShowFeedbackModal(true);
    }
  }

  const handleDelete = async () => {

    const pagesIds = checkboxesSelected.map(item => item.PageId);
    const response = await api.post("/page/delete", {   
      pages: pagesIds,
    })
    if (response.status === 200 || response.status === 201) {
      setFeedbackMessage("Páginas apagadas com sucesso!");
      await fetchData();
      setCheckboxesSelected([]);
      setShowFeedbackModal(true);
    }
    else{
      setFeedbackMessage("Erro ao apagar páginas!");
      setCheckboxesSelected([]);
      setShowFeedbackModal(true);
    }
  }

  // Filter data based on search term
  const filteredData = data.filter(item => 
    item.Url.toLowerCase().includes(search.toLowerCase()) ||
    item.Error.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>Avaliações com erro</h1>
      <p>
        Num total de {search ? filteredData.length : data.length} páginas{search ? ` (${filteredData.length} de ${data.length} filtradas)` : ''}.
      </p>
      <div className="content bg-white">
        <h2>Lista de todas as páginas que falharam a avaliação {type === "AMS" ? "no AMS" : "no MyMonitor"}</h2>
      <div className="d-flex justify-content-start gap-3 mt-4 mb-4">
        <Button
          darkTheme={theme}
          text="Re-avaliar"
          className="btn-primary"
          disabled={checkboxesSelected.length === 0}
          onClick={handleReEvaluate}
        />
        <Button
          darkTheme={theme}
          text="Remover da lista"
          className="btn-primary"
          disabled={checkboxesSelected.length === 0}
          onClick={handleRemoveFromList}
        />
        <Button
          darkTheme={theme}
          text="Apagar"
          className="btn-primary"
          disabled={checkboxesSelected.length === 0}
          onClick={handleDelete}
        />
      </div>
      
      <div className="d-flex gap-2 align-items-center mb-3">
        <span>Filtrar páginas:</span>
        <InputSearch
          darkTheme={theme}
          placeholder="Filtrar páginas..."
          label="Filtrar páginas"
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      
        <SortingTable
        darkTheme={theme}
        headers={directoriesHeaders}
        setDataList={setData}
        dataList={filteredData}
        columnsOptions={columnsOptions}
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
            "itens por página", // selectorAria
            "seletor" // selectorNav
        ]}
        itemsPaginationTexts={[
            " de ",    // of
            " itens "  // items
        ]}
        pagination={true}
        totalItems={filteredData.length}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handleItemsPerPageChange}
        caption="Lista de todas as páginas que falharam a avaliação"
        iconsAltTexts={nameOfIcons}
        project={""}
        checkboxesSelected={checkboxesSelected}
        setCheckboxesSelected={setCheckboxesSelected}
        checkedItems={checkboxesSelected}
        rowKey="id"
        />  
      </div>
      <Modal
        isOpen={showFeedbackModal}
        onRequestClose={() => setShowFeedbackModal(false)}
        title="Páginas"
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

export default EvaluationWithErrors;
