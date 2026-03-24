import React, { useState, useEffect } from "react";
import { Button, StatisticsHeader, Breadcrumb, Icon } from "ama-design-system";
import "./style.users.css";
import { useParams } from "react-router-dom";
import { dataRowsPage  } from "./table.config.jsx";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from "react-i18next";
import { getEffectiveNavigationContext } from "../../utils/navigation";
import {  getTestResults } from "../../utils/utils";
import { ruleset, translations as translationsRuleset } from  "@a12e/accessmonitor-rulesets";
import TableDetails from "../../components/TableDetails/TableDetails.jsx";

const DetailedPageLine = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const { t } = useTranslation();

  const [statsTitle, setWebsiteStatsTitle] = useState([
    { subtitle: 'Sítios Web', subtitle2: "" },
    { subtitle: 'Sítios Web não conformes', subtitle2: "" },
    { subtitle: 'Sítios Web conformes', subtitle2: "" },
    {
      subtitle: "Conformidade A",
      subtitle2: "Sem erros de nível A"
    },
    {
      subtitle: "Conformidade AA",
      subtitle2: "Sem Erros de Nível A + AA"
    }, {
      subtitle: "Conformidade AAA",
      subtitle2: "Sem erros de nível A + AA + AAA"
    }
  ])
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [data, setData] = useState(dataRowsPage)
  const [checkboxesSelected, setCheckboxesSelected] = useState([])
  const [detailsData, setDetailsData] = useState({});
  const { pageUrl, details, idPage } = useParams();
  const navigate = useNavigate();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

  useEffect(() => {
    console.log('ruleset', );
    const currentPath = location.pathname;
    const navContext = getEffectiveNavigationContext(currentPath);
    const pageLink = `/dashboard/pages/view/${encodeURIComponent(pageUrl || "")}`;
    const detailsPageLink = idPage ? `/dashboard/pages/details/${encodeURIComponent(pageUrl || "")}/${idPage}` : pageLink;

    if (navContext) {
      if (navContext.type === 'website') {
        const { websiteId, websiteSlug, websiteName } = navContext.data;
        const slugOrName = websiteSlug || encodeURIComponent(websiteName || "");
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/websites">Sítios Web</Link> },
          { children: <Link to={`/dashboard/websites/view/${websiteId}/${slugOrName}`}>{websiteName || "Sítio Web"}</Link> },
          { children: <Link to={pageLink}>Páginas</Link> },
          { children: <Link to={detailsPageLink}>Detalhes da página</Link> },
          { title: "Detalhes do teste" }
        ]);
      } else if (navContext.type === 'directory') {
        const { directoryName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/directories">Diretórios</Link> },
          { children: <Link to={`/dashboard/directories/view/${encodeURIComponent(directoryName)}`}>{directoryName}</Link> },
          { children: <Link to={pageLink}>Páginas</Link> },
          { children: <Link to={detailsPageLink}>Detalhes da página</Link> },
          { title: "Detalhes do teste" }
        ]);
      } else if (navContext.type === 'entity') {
        const { entityName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/entities">Entidades</Link> },
          { children: <Link to={`/dashboard/entities/view/${encodeURIComponent(entityName)}`}>{entityName}</Link> },
          { children: <Link to={pageLink}>Páginas</Link> },
          { children: <Link to={detailsPageLink}>Detalhes da página</Link> },
          { title: "Detalhes do teste" }
        ]);
      } else if (navContext.type === 'category') {
        const { categoryName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/categories">Categorias</Link> },
          { children: <Link to={`/dashboard/categories/view/${encodeURIComponent(categoryName)}`}>{categoryName}</Link> },
          { children: <Link to={pageLink}>Páginas</Link> },
          { children: <Link to={detailsPageLink}>Detalhes da página</Link> },
          { title: "Detalhes do teste" }
        ]);
      }
    } else {
      setBreadcrumbs([
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/pages">Páginas</Link> },
        { children: <Link to={detailsPageLink}>Detalhes da página</Link> },
        { title: "Detalhes do teste" }
      ]);
    }

    const fetchData = async () => {
      const response = JSON.parse(localStorage.getItem('@AMS:evalData'));
      const responseDetails = getTestResults(ruleset[details]?.test, response);
      setData(responseDetails);
      console.log('responseDetails', responseDetails)
      setDetailsData(responseDetails.tot.results[details]);
    };
    fetchData();
  }, [pageUrl, details, idPage]);
  return (
    <div>
      <Breadcrumb data={breadcrumbs} />

      <h1>Detalhes do teste</h1>
      <div className="bg-white show_details">
              <div className="d-flex flex-row justify-content-between align-items-center show_details-container">
                <div className="d-flex flex-row align-items-center">
                  <div className={`d-flex align-items-center justify-content-center m-2 p-3 ${data.result === "R" ? "error-cell" : detailsData?.result === "Y" ? "warning-cell" : "success-cell"}`}>
                    <Icon name={data?.result === "R" ? "AMA-Wrong-Line" : data?.result === "Y" ? "AMA-Middle-Line" : "AMA-Check-Line"} />
                  </div>

                  <span
                    className="textHeader ama-typography-body-large bold"
                    dangerouslySetInnerHTML={{ __html: t('ELEMS.' + ruleset[details]?.test, {value: data.size}) }}
                  />
                </div>

                <div className="result_left_container">
                  <span className="ama-typography-display-6 bold p-2 ps-4">{data.size}</span>
                  <span className="ama-typography-body p-2">{t("ELEMENT_RESULTS.total_elements")}</span>
                </div>
              </div>
            </div>
      <div className="mt-5 bg-white p-4">
        <TableDetails data={data.elements} domainUrl={pageUrl} />
      </div>

    </div>
  )
}

export default DetailedPageLine;
