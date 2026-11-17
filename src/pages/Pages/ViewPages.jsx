import { useState, useEffect } from "react";
import qs from "qs";
import { Button, Breadcrumb, SortingTable } from "@a12e/accessmonitor-ds";
import "./style.users.css";
import { useParams } from "react-router-dom";
import { directoriesHeadersPage, dataRowsPage, columnsOptionsPage, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext';
import { api } from "../../config/api";
import moment from "moment";
import { getEffectiveNavigationContext } from "../../utils/navigation";
import { calculateTotalElements } from "../../utils/utils";
const ViewPages = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [data, setData] = useState(dataRowsPage)
  const [checkboxesSelected, setCheckboxesSelected] = useState([])
  const { pageUrl } = useParams();
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
    const currentPath = location.pathname;
    const navContext = getEffectiveNavigationContext(currentPath);
    
    if (navContext) {
      if (navContext.type === 'website') {
        const { websiteId, websiteSlug, websiteName } = navContext.data;
        const slugOrName = websiteSlug || encodeURIComponent(websiteName || "");
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/websites">Sítios Web</Link> },
          { children: <Link to={`/dashboard/websites/view/${websiteId}/${slugOrName}`}>{websiteName || "Sítio Web"}</Link> },
          { title: "Páginas" }
        ]);
      } else if (navContext.type === 'directory') {
        const { directoryName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/directories">Diretórios</Link> },
          { children: <Link to={`/dashboard/directories/view/${encodeURIComponent(directoryName)}`}>{directoryName}</Link> },
          { title: "Páginas" }
        ]);
      } else if (navContext.type === 'entity') {
        const { entityName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/entities">Entidades</Link> },
          { children: <Link to={`/dashboard/entities/view/${encodeURIComponent(entityName)}`}>{entityName}</Link> },
          { title: "Páginas" }
        ]);
      } else if (navContext.type === 'category') {
        const { categoryName } = navContext.data;
        setBreadcrumbs([
          { children: <Link to="/dashboard/home">Início</Link> },
          { children: <Link to="/dashboard/categories">Categorias</Link> },
          { children: <Link to={`/dashboard/categories/view/${encodeURIComponent(categoryName)}`}>{categoryName}</Link> },
          { title: "Páginas" }
        ]);
      }
    } else {
      setBreadcrumbs([
        { children: <Link to="/dashboard/home">Início</Link> },
        { children: <Link to="/dashboard/pages">Páginas</Link> },
        { title: "Páginas" }
      ]);
    }

    const fetchData = async () => {
      const pagesQuery = qs.stringify({ filters: { searchTerm: pageUrl } });
      const pagesResponse = await api.get(`/pages?${pagesQuery}`);
      const page = pagesResponse.data.data.find(item => item.url === pageUrl) ?? pagesResponse.data.data[0];
      if (!page) {
        setData([]);
        return;
      }
      const websiteId = page.websiteId ?? page.website?.id;

      const evaluationsQuery = qs.stringify(
        { contexts: ["MONITOR", "AMS"], sorts: { createdAt: "DESC" } },
        { arrayFormat: "brackets" }
      );
      const response = await api.get(`/evaluations/website/${websiteId}/page/${page.id}?${evaluationsQuery}`);
      const evaluations = response.data.data.data;
      setData(evaluations.map(item => {
        const elementCount = item.tagCount && typeof item.tagCount === "object"
          ? calculateTotalElements(item.tagCount)
          : Number(item.tagCount) || 0;

        return {
          id: item.id,
          date_avaliation: item.evaluationDate
            ? moment(item.evaluationDate).format('DD/MM/YYYY')
            : (item.createdAt ? moment(item.createdAt).format('DD/MM/YYYY') : 'Pendente'),
          score: item.score ?? "-",
          elementsNumber: elementCount,
          A: item.A,
          AA: item.AA,
          AAA: item.AAA,
          state: "Relatório",
        };
      }));
    };
    fetchData();
  }, [pageUrl]);
  return (
    <div>
      <Breadcrumb data={breadcrumbs} />

      <h1>Página</h1>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Avaliações efetuadas ao longo do tempo</h2>
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeadersPage}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptionsPage(navigate, pageUrl)}
          nextPage={() => null}
          caption="Histórico de avaliações da página"
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      <div className="mt-5 bg-white">
        <h2>Exportação de dados</h2>
        <p>Para exportar os dados da última avaliação da página pressione o botão &quot;Exportar úlitma avaliação da página em CSV&quot;. Para exportar os dados de todas as avaliações efetuadas à página pressione &quot;Exportar todas as avaliações da página em CSV&quot;.
        </p>
        <div className="d-flex justify-content-start align-items-end gap-3">
          <Button
            darkTheme={theme}
            text={"Exportar última avaliação da página em CSV"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
          />
          <Button
            darkTheme={theme}
            text={"Exportar todas as avaliações da página em CSV"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
          />
        </div>
      </div>
    </div>
  )
}

export default ViewPages;
