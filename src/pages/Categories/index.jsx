import React, { useState } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb } from "ama-design-system";
import "./style.users.css";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { categoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { useTranslation } from 'react-i18next';

const CategoriesList = () => {

  const { theme } = useTheme();
  const [data, setData] = useState(dataRows)
  const [checkboxesSelected, setCheckboxesSelected] = useState([])
  const { t } = useTranslation();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },

    {
      title: "Categorias",
    }
  ];
  return (

    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />

      <h1>{t('CATEGORIES_PAGE.LIST.title')}</h1>
      <p>Abaixo encontra a listagem de todas as categorias registadas no AdminMonitorSuite, num total de 58 categorias.</p>

      <div className="content bg-white bg-white">

        <h2>{t('CATEGORIES_PAGE.LIST.subtitle')}</h2>
        <div className="d-flex gap-2 align-items-center mb-3">
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

            text={t('CATEGORIES_PAGE.LIST.re_evaluate_tags')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log(t('CATEGORIES_PAGE.LIST.re_evaluate_tags'))}
          />
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.crawler')}
            icon={"AMA-Adicionar-Line"}

            className="btn-primary"
            onClick={() => console.log(t('CATEGORIES_PAGE.LIST.crawler'))}
          />

          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.delete_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log(t('CATEGORIES_PAGE.LIST.delete_pages'))}
          />
          <Button
            darkTheme={theme}
            text={t('CATEGORIES_PAGE.LIST.delete_tags')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log(t('CATEGORIES_PAGE.LIST.delete_tags'))}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={categoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={t('CATEGORIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
        />
      </div>
    </div>
  )
}

export default CategoriesList;