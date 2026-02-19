import React, { useState, useEffect } from "react";
import "./style.users.css";
import {
  dataRows,
} from "./table.config";
import { Link } from "react-router-dom";
import ContentListPages from "./components/ContentListPage";
import { Breadcrumb, Button } from "ama-design-system";
import { useTranslation } from "react-i18next";
import { api } from "../../config/api";
import { isRequestSuccessful } from "../../utils/apiHelpers.js";
import { Modal } from "../../components/Modal";
import { useTheme } from '../../context/ThemeContext';
import { setWebsiteNavigationContext } from "../../utils/navigation";
import { useUniqueCheckboxSelection } from "../../hooks/useUniqueCheckboxSelection";

// Lightweight date formatter to replace moment.js
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Function to count total elements from structure like {"document":1,"generic":1,"heading":1,"separator":1}
const calculateTotalElements = (elementCount) => {
  if (!elementCount || typeof elementCount !== 'object') {
    return 0;
  }
  
  // Sum all values in the object
  return Object.values(elementCount).reduce((total, count) => {
    const num = Number(count);
    return total + (isNaN(num) ? 0 : num);
  }, 0);
  
};

const PageList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [checkboxesSelected, setCheckboxesSelected] = useUniqueCheckboxSelection([]);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const theme = useTheme();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    {
      title: "Páginas",
    },
  ];

  // Clear website context when viewing pages list directly
  useEffect(() => {
    setWebsiteNavigationContext(null);
  }, []);

  const handleSearchChange = (value) => {
    setSearch(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  const fetchData = async () => {
    setCheckboxesSelected([]);
    
    try {
      const offset = currentPage - 1;
      let url = `/page/all/${itemsPerPage}/${offset}/sort=desc/direction=/search=${search}`;
      const [totalItemsResponse, dataResponse] = await Promise.all([
        api.get(`/page/all/count/search=${search}`),
        api.get(url)
      ]);
      
      console.log("Pages API response:", { total: totalItemsResponse.data, data: dataResponse.data });
      
      setTotalItems(Number(totalItemsResponse.data.result));
      
      const transformedData = (dataResponse.data.result || []).map(item => ({
        id: item.PageId,
        Uri: item.Uri,
        Score: item.Score != null ? Number(item.Score) : 0,
        Evaluation_Date: item.Evaluation_Date ? formatDate(item.Evaluation_Date) : "Pendente",
        Element_Count: calculateTotalElements(item.Element_Count),
        A: item.A ?? 0,
        AA: item.AA ?? 0,
        AAA: item.AAA ?? 0,
        e: "?",
        OPAW: item.Show_In ? (item.Show_In.split("")[2] === "1" ? "Sim" : "Nao") : "Nao",
      }));
      
      setData(transformedData);
    } catch (error) {
      console.error("Error loading pages:", error);
      setFeedbackMessage("Erro ao carregar paginas!");
      setShowFeedbackModal(true);
    }
  };
  // Fetch total count and current page data with parallel API calls
  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, search]);

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (n) => {
    setItemsPerPage(n);
    setCurrentPage(1); // Reset to first page
  };
  
  const handleDeletePages = async () => {
    const pagesIds = checkboxesSelected.map(item => item.id);
    const response = await api.post("/page/delete", {
      pages: pagesIds,
    })
    if (response.status === 200 || response.status === 201) {
      const deletedIds = new Set(checkboxesSelected.map(item => item.id));
      setFeedbackMessage("Páginas excluídas com sucesso!");
      setShowFeedbackModal(true);
      setCheckboxesSelected([]);
      setData(prevData => prevData.filter(item => !deletedIds.has(item.id)));
      setTotalItems(prevTotal => Math.max(prevTotal - deletedIds.size, 0));
    } else {
      setFeedbackMessage("Erro ao excluir páginas!");
      setShowFeedbackModal(true);
    }
  };

  const handleShowHideObservatory = async () => {
    console.log("CHECKED OBSERVATORY: ",checkboxesSelected)
    const pagesToAdd = checkboxesSelected.filter(item => item.OPAW === "Nao");
    const pagesToRemove = checkboxesSelected.filter(item => item.OPAW === "Sim");
    
    await Promise.all(checkboxesSelected.map(async item => {
      const response = await api.post(`/page/update`, {
        pageId: item.id,
        checked: item.OPAW === "Nao" // false = hide from Observatory, true = show in Observatory
      });
   
    
    let message = '';
    if (pagesToAdd.length > 0 && pagesToRemove.length > 0) {
      message = `As páginas foram atualizadas no observatório com sucesso! ${pagesToAdd.length} página(s) adicionada(s) e ${pagesToRemove.length} página(s) removida(s).`;
    } else if (pagesToAdd.length > 0) {
      message = `${pagesToAdd.length} página(s) adicionada(s) ao observatório com sucesso!`;
    } else if (pagesToRemove.length > 0) {
      message = `${pagesToRemove.length} página(s) removida(s) do observatório com sucesso!`;
    } else {
      message = 'As páginas foram atualizadas no observatório com sucesso!';
    }
    
    setFeedbackMessage(message);
    await fetchData();
    setShowFeedbackModal(true);
  }));
  };
  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t('PAGES_PAGE.LIST.title')}</h1>
      <p>
        {t('PAGES_PAGE.LIST.subtitle')} num total de {totalItems} páginas.
      </p>
      <div className="content bg-white">
        <h2>{t('PAGES_PAGE.LIST.title')}</h2>
        <ContentListPages 
          checkboxesSelected={checkboxesSelected}
          setCheckboxesSelected={setCheckboxesSelected}
          data={data}
          setData={setData}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={setItemsPerPage}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          search={search}
          handleSearchChange={handleSearchChange}
          handleDeletePages={handleDeletePages}
          handleShowHideObservatory={handleShowHideObservatory}
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

export default PageList;
