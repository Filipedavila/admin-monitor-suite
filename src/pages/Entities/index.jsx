import React, { useState } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb } from "ama-design-system";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import "./style.users.css";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";

const EntitiesList = () => {
  const location = useLocation();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);
  const { t } = useTranslation();
  const { theme } = useTheme();
  const [data, setData] = useState(dataRows);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  useEffect(() => {
    setBreadcrumbs([
      { children: <Link to="/dashboard/home">Início</Link> },
      { title: "Entidades" }
    ]);
  }, []);
  

  return (
    <div>
            <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
      
      <h2>{t('ENTITIES_PAGE.LIST.title')}</h2>
      <p>
        Abaixo encontra a listagem de todas as entidades registadas no AdminMonitorSuite, num total de 1286 entidades.


      </p>

      <div className="content bg-white">
        <h2>{t('ENTITIES_PAGE.LIST.subtitle')}</h2>
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
            text={t('ENTITIES_PAGE.LIST.delete_entities')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log(t('ENTITIES_PAGE.ADD.title'))}
          />
        </div>
        <SortingTable
         darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
        />
      </div>
    </div>
  );
};

export default EntitiesList;