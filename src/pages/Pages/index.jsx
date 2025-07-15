import React, { useState } from "react";
import "./style.users.css";
import {
  dataRows,
} from "./table.config";
import { Link } from "react-router-dom";
import ContentListPages from "./components/ContentListPage";
import { Breadcrumb } from "ama-design-system";
import { useTranslation } from "react-i18next";
const PageList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(dataRows);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    {
      title: "Páginas",
    },
  ];
  return (
    <div>
                    <Breadcrumb data={breadcrumbs} />
      <h1>{t('PAGES_PAGE.LIST.title')}</h1>
      <p>
        {t('PAGES_PAGE.LIST.subtitle')}
      </p>

      <div className="content bg-white">
        <h2>{t('PAGES_PAGE.LIST.title')}</h2>
        
        <ContentListPages 
        checkboxesSelected={checkboxesSelected}
        setCheckboxesSelected={setCheckboxesSelected}
        data={data}
        setData={setData}
        />
      </div>
    </div>
  );
};

export default PageList;
