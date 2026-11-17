import { useState, useEffect } from "react";
import qs from "qs";
import { Breadcrumb, Icon } from "@a12e/accessmonitor-ds";
import "./style.users.css";
import { useParams } from "react-router-dom";

import { Link, useLocation } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { getEffectiveNavigationContext } from "../../utils/navigation";
import { getTagName, fixCode } from "../../utils/utils";
import { ruleset } from "@a12e/accessmonitor-rulesets";
import { api } from "../../config/api.js";
import TableDetails from "../../components/TableDetails/TableDetails.jsx";

const DetailedPageLine = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [data, setData] = useState({ result: "G", elements: [], size: 0 });
  const { pageUrl, details, idPage } = useParams();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);

  useEffect(() => {
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
      // `details` is the ruleset's own rule key (e.g. "title_06"); the evaluation
      // endpoints key their results by the test name held in `.test` (e.g. "titleOk").
      const testName = ruleset[details]?.test;
      if (!testName) {
        return;
      }

      try {
        const pagesQuery = qs.stringify({ filters: { searchTerm: pageUrl } });
        const pagesResponse = await api.get(`/pages?${pagesQuery}`);
        const page = pagesResponse.data.data.find(item => item.url === pageUrl) ?? pagesResponse.data.data[0];
        const websiteId = page?.websiteId ?? page?.website?.id;
        const pageId = page?.id;

        if (!websiteId || !pageId) {
          return;
        }

        const nodesResponse = await api.get(`/evaluations/website/${websiteId}/page/${pageId}/evaluation/${idPage}/nodes`);
        const nodesPayload = nodesResponse.data?.data ?? nodesResponse.data;
        const entries = nodesPayload?.[testName] || [];

        const elements = entries.flatMap(entry => (entry.elements || []).map(el => ({
          ele: getTagName(el),
          code: fixCode(el.htmlCode),
          showCode: fixCode(el.htmlCode, undefined, true),
          pointer: el.pointer,
        })));

        const result = entries.some(entry => entry.verdict === 'failed')
          ? 'R'
          : entries.some(entry => entry.verdict === 'warning')
            ? 'Y'
            : 'G';

        setData({ result, elements, size: elements.length });
      } catch (error) {
        console.error("Erro ao carregar os detalhes do teste", error);
      }
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
                  <div className={`d-flex align-items-center justify-content-center m-2 p-3 ${data.result === "R" ? "error-cell" : data.result === "Y" ? "warning-cell" : "success-cell"}`}>
                    <Icon name={data.result === "R" ? "AMA-Wrong-Line" : data.result === "Y" ? "AMA-Middle-Line" : "AMA-Check-Line"} />
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
