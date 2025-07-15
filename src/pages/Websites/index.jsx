import React, { useState, useEffect } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb } from "ama-design-system";
import "./style.users.css";
import { Link, useLocation } from "react-router-dom";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import ContentListWebSites from "./components/ContentListWebSites.jsx";
import { useTranslation } from 'react-i18next';

const WebSiteList = () => {
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
       
    const [data, setData] = useState(dataRows)
    const [checkboxesSelected, setCheckboxesSelected] = useState([])
    const breadcrumbs = [
        { children: <Link to="/dashboard/home">Início</Link> },
        {
            title: "Sítio Web",
        }
    ];
    return (

        <div>
            <Breadcrumb data={breadcrumbs} />
            <h1>{t('WEBSITES_PAGE.LIST.title_list')}</h1>
            <p>Abaixo encontra a listagem de todos os sítios web registados no AdminMonitorSuite, num total de 2179 sítios web.

</p>

            <div>

                <ContentListWebSites
                title={t('WEBSITES_PAGE.LIST.subtitle_list')}
                    checkboxesSelected={checkboxesSelected}
                    setCheckboxesSelected={setCheckboxesSelected}
                    data={data}
                    setData={setData}
                />

            </div>
        </div>
    )
}

export default WebSiteList;