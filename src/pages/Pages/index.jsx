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
import moment from "moment";
import { Modal } from "../../components/Modal";
import { useTheme } from '../../context/ThemeContext';

const PageList = () => {
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
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    {
      title: "Páginas",
    },
  ];

  const handleSearchChange = (value) => {
    setSearch(value.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Fetch total count and current page data
  useEffect(() => {
    const fetchData = async () => {
      const responseTotal = await api.get(`/page/all/count/search=${search}`);
      setTotalItems(Number(responseTotal.data.result));
      const offset = currentPage - 1;
      const response = await api.get(`/page/all/${itemsPerPage}/${offset}/sort=/direction=/search=${search}`); 
      setData(response.data.result.map(item => ({
        id: item.PageId,
        Uri: item.Uri,
        Score: Number(item.Score),
        Evaluation_Date: moment(item.Evaluation_Date).format('DD/MM/YYYY'),
        Element_Count: 12,//item.Element_Count,
        A: item.A,
        AA: item.AA,
        AAA: item.AAA,
        e: "N/A",
        OPAW: "OPAW",
      })));
    };
    fetchData();
  }, [currentPage, itemsPerPage, search]);

  // Handle page change
  const handlePageChange = (page) => setCurrentPage(page);

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
    if(response.data.success){
      setFeedbackMessage("Páginas excluídas com sucesso!");
      setShowFeedbackModal(true);
      setCheckboxesSelected([]);
      setData(data.filter(item => !checkboxesSelected.includes(item.id)));
      setTotalItems(totalItems - checkboxesSelected.length);
    } else {
      setFeedbackMessage("Erro ao excluir páginas!");
      setShowFeedbackModal(true);
    }

  } 

  const handleShowHideObservatory = async () => {
    await Promise.all(checkboxesSelected.map(async item => {
      const response = await api.post(`/page/update`, {
        pageId: item.id,
        checked: true  // false = hide from Observatory, true = show in Observatory
      });
    }));
    setFeedbackMessage('As páginas foram adicionadas ao observatório com sucesso!');
    setShowFeedbackModal(true);
   }
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
