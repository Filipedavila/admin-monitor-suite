import React, { useState, useEffect } from "react";
import { InputSearch, SortingTable, Button, Breadcrumb } from "@a12e/accessmonitor-ds";
import { useTheme } from '../../context/ThemeContext.jsx';
import { useTranslation } from 'react-i18next';
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { Link } from "react-router-dom";
import {api} from "../../config/api";
export default function LogsList() {
  const { theme } = useTheme();
  const { t } = useTranslation();

    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        {
            title: "Logs",
        }
    ];
    const [data, setData] = useState(dataRows);
    const [dataError, setDataError] = useState(dataRows);
    const [checkboxesSelected, setCheckboxesSelected] = useState([]);
    useEffect(() => {
      const fetchData = async () => {
        const response = await api.get('/log/action-log');
        const responseError = await api.get('/log/error-log');
        setData(response.data.result.map(item => ({
          log: item
        })));
        setDataError(responseError.data.result.map(item => ({
          log: item
        })));
      }
      fetchData();
    }, []);
  return (
    <div>
      <Breadcrumb data={breadcrumbs} />
      <h1>{t('LOGS_PAGE.LIST.title')}</h1>
      <div className="content bg-white">
        <h2>{t('LOGS_PAGE.LIST.subtitle')}</h2>
        <div className="d-flex gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + '...'}
            label={t('MISC.filter')}
            id="search"
          />
        </div>

        
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={t('LOGS_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />


      </div>

      <div className="content bg-white mt-4">
        <h2>{t('LOGS_PAGE.LIST.subtitle_error')}</h2>
        <div className="d-flex gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')}</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + '...'}
            label={t('MISC.filter')}
            id="search"
          />
        </div>

               
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setDataError}
          dataList={dataError}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={t('LOGS_PAGE.LIST.table.title_error')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>
    </div>
  );
} 