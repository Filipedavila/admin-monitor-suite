import React, { useEffect, useState } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb } from "ama-design-system";
import { useTheme } from '../../context/ThemeContext';
import "./style.users.css";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const DirectoriesList = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);
 const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/directories">Diretórios</Link> },

  ];
  const [data, setData] = useState(dataRows);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  useEffect(() => {
    localStorage.setItem('openSubmenu', JSON.stringify({ id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" }));
    localStorage.setItem('activeMenuItem', JSON.stringify({ id: "directories", label: "Diretórios", icon: "AMA-Pasta-Line", url: "/dashboard/directories" }));
  }, []);
  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />

      <h1>{t('DIRECTORIES_PAGE.LIST.title_list')}</h1>
<p>Abaixo encontra a listagem de todos os diretórios registados no AdminMonitorSuite, num total de 38 diretórios.</p>

      <div className="content bg-white">
        <h2>{t('DIRECTORIES_PAGE.LIST.subtitle_list')}</h2>
        <div className="d-flex  gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + '...'}
            label={t('MISC.filter')}
          />
        </div>
        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.re_evaluate_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log(t('DIRECTORIES_PAGE.LIST.delete_directories'))}
          />
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.delete_page')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log(t('DIRECTORIES_PAGE.LIST.delete_directories'))}
          />
          <Button
            darkTheme={theme}
            text={t('DIRECTORIES_PAGE.LIST.delete_directories')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log(t('DIRECTORIES_PAGE.LIST.delete_directories'))}
          />


        </div>
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={t('DIRECTORIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
        />
      </div>
    </div>
  );
};

export default DirectoriesList;