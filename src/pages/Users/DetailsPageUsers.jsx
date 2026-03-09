import React, { useState, useEffect } from "react";
import { Button, StatisticsHeader, Breadcrumb, TableComponent, StatsTable } from "ama-design-system";
import "./style.users.css";
import { useParams } from "react-router-dom";
import { Link, useLocation, useNavigate  } from "react-router-dom";
import { useTheme } from '../../context/ThemeContext.jsx';
import { api } from "../../config/api.js";
import Indicators from "../../components/Indicators/index.jsx";
import { ruleset } from "@a12e/accessmonitor-rulesets";
import { useTranslation } from "react-i18next";
import {Modal} from "../../components/Modal.jsx";
const calculateMatrix = (data) => {
  const matrix = {
    A: { ok: 0, err: 0, war: 0 },
    AA: { ok: 0, err: 0, war: 0 },
    AAA: { ok: 0, err: 0, war: 0 }
  };

  let totalCount = 0;

  data.forEach(item => {
    const level = item.lvl || 'A';
    
    if (matrix[level]) {
      if (item.tdClassName === 'success-cell') {
        matrix[level].ok++;
      } else if (item.tdClassName === 'error-cell') {
        matrix[level].err++;
      } else if (item.tdClassName === 'warning-cell') {
        matrix[level].war++;
      }
      totalCount++;
    }
  });

  return {
    data:{
      infoak: matrix,
      metadata: {
        count_results: totalCount
      }
    }
  };
};

const DetailsPageUsers = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
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
  const { pageUrl, username, name, id } = useParams();
  const [openModal, setOpenModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [breadcrumbs, setBreadcrumbs] = useState([
    { children: <Link to="/dashboard/home">Início</Link> },
    { children: <Link to="/dashboard/users">Utilizadores</Link> },
    { children: <Link to={`/dashboard/users/websites/${username}`}>Sítios Web do Utilizador {username}</Link> },
    { children: <Link to={`/dashboard/users/websites/pages/${username}/${encodeURIComponent(name)}`}>{name}</Link> },
    { title: "Relatório de acessibilidade da página" }
  ]);
  const [data, setData] = useState([
    {
      id: "1",
      title:
        "I found 1 image on the page without the alternative text equivalent.",
      component: (
        <div>
          Check if the alternative text equivalent found in the images provides
          equal information or function as the one performed by the image on the
          page. H37: Using alt attributes on img elements This WCAG 2.1
          technique is related to: Success criteria 1.1.1 (Level A) Notions
          about the SC 1.1.1
        </div>
      ),
      lvl: "AA",
      iconName: "AMA-Middle-Line",
      ele: "test",
      tdClassName: "warning-cell"
    },
  ])

  const [matrixData, setMatrixData] = useState({
    data: {
    infoak: {
      A: { ok: 2, err: 1, war: 0 },
      AA: { ok: 0, err: 0, war: 0 },
      AAA: { ok: 0, err: 0, war: 0 }
    },
      metadata: {
        count_results: 3
      }
    }
  })

  const [listItems, setListItems] = useState([
    { title: 'Pontuação média', value: 8 },
    { title: 'URL', value: "processando..." },
    { title: 'Título', value: "processando..." },
    { title: 'Nº de elementos (x)HTML	', value: "processando..." },
    { title: 'Tamanho da página	', value: "processando..." },
  ]);
  const navigate = useNavigate();
  useEffect(() => {
    const currentPath = location.pathname;
    const lastPath = localStorage.getItem('currentPath');
    if (lastPath && lastPath !== currentPath) {
      localStorage.setItem('previousPath', lastPath);
    }
    localStorage.setItem('currentPath', currentPath);
  }, [location.pathname]);


    const fetchData = async () => {
      try {
      const response = await api.get(`/evaluation/user/monitor/${encodeURIComponent(pageUrl)}`); 
      const result = response.data.result.data;
      setListItems([
        { title: 'Pontuação média', value: result.score },
        { title: 'URL', value: result.tot.info.url},
        { title: 'Título', value: result.tot.info.title },
        { title: 'Nº de elementos (x)HTML	', value: result.tot.info.htmlTags },
        { title: 'Tamanho da página	', value:result.tot.info.size + " bytes"},
      ]);

      const mappedData = Object.keys(result.tot.results).map(item => ({
        id: item.id,
        title: t('TESTS_RESULTS.' +item + '.p'),
        lvl: ruleset[item].level.toUpperCase(),
        component: (
    <div className="text-start">
            <div  dangerouslySetInnerHTML={{__html: t('TXT_TECHNIQUES.' + ruleset[item].ref)}} />
            <span>Esta técnica WCAG 2.1 está relacionada com:</span>
            <ul>
              {ruleset[item].scs.map(sc => (
                <li className="list-table" key={sc}>Critério de sucesso {sc} <em>(Nível {ruleset[item].level.toUpperCase()})</em></li>
              ))}
            </ul>
            </div>
        ),
        iconName: ruleset[item].result === "warning" ? "AMA-Middle-Line" : ruleset[item].result === "failed" ? "AMA-Wrong-Line" : "AMA-Check-Line",
        ele: ruleset[item].ele,
        tdClassName: ruleset[item].result === "warning" ? "warning-cell" : ruleset[item].result === "failed" ? "error-cell" : "success-cell"
      }));

      setData(mappedData);
      setMatrixData(calculateMatrix(mappedData));
    } catch (error) {
      setOpenModal(true);
      setErrorMessage("Erro ao carregar o relatório de acessibilidade da página");
    } finally {
      setLoading(false);
    }
    }
  useEffect(() => {
    fetchData();
  }, [pageUrl, id]);
  return (
    <div>
      <Breadcrumb data={breadcrumbs} />

      <h1>Relatório de acessibilidade da página</h1>
      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Sumário</h2>
        <Indicators listItems={listItems} />
      </div>

      <div className="mt-5 bg-white p-4">
        <h2 className="mb-4">Matriz de Práticas</h2>
        <StatsTable
        darkTheme={theme}
        data={matrixData}
        ok={"Aceitáveis"}
        warning={"Para ver manualmente"}
        error={"Não aceitáveis"}
        title={" práticas encontradas"}
        caption={"Sumário das práticas avaliadas"}
        type={"Tipo de prática"}
      />
      </div>

      <div className="mt-5 bg-white">
        <h2>Avaliação</h2>
     
        <div className="d-flex justify-content-start align-items-end gap-3">
         <TableComponent 
         data={data} 
         onClick={e => console.log(e)} 
         caption={"Práticas avaliadas"} 
         col1={"Prática encontrada"} 
         col2={"Nível"} 
         col3={"Ver detalhe"} 
         lvlTitle={"Nível: "} 
         imageTitlesCallback={t => ()=>{}} 
         darkTheme={theme} 
         ariaLabels={{
          AA: "duplo ",
          AAA: "triplo ",
          button: "Ver detalhe"
        }} />
        </div>
      </div>
      <Modal
        title="Erro"
        onClose={() => setOpenModal(false)}
        isOpen={openModal}
      >
        <p>{errorMessage}</p>
        <Button
          darkTheme={theme}
          text="Fechar"
          className="btn-primary"
          onClick={() => {
            setOpenModal(false);
            navigate(`/dashboard/users/websites/${username}`);
          }}
        />
      </Modal>
    </div>
  )
}

export default DetailsPageUsers;