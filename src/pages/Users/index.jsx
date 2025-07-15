import React, { useState } from "react";
import {
  Button,
  InputSearch,
  SortingTable,
  Breadcrumb,
} from "ama-design-system";
import "./style.users.css";
import {
  directoriesHeaders,
  dataRows,
  columnsOptions,
  nameOfIcons,
  paginationButtonsTexts,
} from "./table.config";
import { useForm } from "react-hook-form";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from 'react-i18next';
import { useEffect } from "react";

const UserList = () => {
  const location = useLocation();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { theme } = useTheme();
  const { t } = useTranslation();
  const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },
    { title: "Utilizadores" },
  ];

  const [data, setData] = useState(dataRows);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);

  const onSubmit = (formData) => {
    console.log("User data:", formData);
    // Lógica de criação de utilizador, se for o caso
  };

  return (
    <div>
      <Breadcrumb data={breadcrumbs} tagHere={t('BREADCRUMB.tag_here')} />
      <h1>{t('USERS_PAGE.LIST.title')}</h1>
      <p>
        {t('USERS_PAGE.LIST.subtitle')}
      </p>

      <div className="content bg-white">
        <h2>{t('USERS_PAGE.LIST.title')}</h2>
          
          <div className="d-flex gap-2 align-items-center mb-4">
            <span>{t('MISC.filter')}</span>

            <InputSearch
              darkTheme={theme}
              placeholder={t('MISC.filter') + '...'}
              label={t('MISC.filter')}
            />
          </div>
 <Button
          darkTheme={theme}
          text={t('USERS_PAGE.LIST.delete_users')}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary mb-3" 
          onClick={() => console.log(t('USERS_PAGE.LIST.delete_users'))}
        />

        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={t( 'USERS_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project=""
          setCheckboxesSelected={setCheckboxesSelected}
        />
      </div>
    </div>
  );
};

export default UserList;
