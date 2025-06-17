import React, { useState } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb } from "ama-design-system";
import { useTheme } from '../../context/ThemeContext';
import "./style.users.css";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
import { Link } from "react-router-dom";

const DirectoriesList = () => {
  const { theme } = useTheme();
  const breadcrumbs = [
    { children: <Link to="/">Home</Link> },
    {
      title: "Dashboard",
    },
  ];
  const [data, setData] = useState(dataRows);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);

  return (
    <div>
      <Breadcrumb data={breadcrumbs} />

      <h1>Directórios</h1>
      <p>
        Abaixo encontra a listagem de todos os Directórios registados no
        AdminMonitorSuite, num total de 38 diretórios.
      </p>

      <div className="content bg-white">
        <h2>Lista de Directórios</h2>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span>Filtrar Directórios:</span>
          <InputSearch
            placeholder={"Pesquisar Directórios..."}
            style={{ width: "87%" }}
          />
        </div>
        <div className="d-flex gap-4 justify-content-end mb-4">
          <Button
            text={"Apagar Directórios"}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={"Estatísticas do diretório" + " " + "Os 25 Portais + Procurados da AP"}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
        />
      </div>
    </div>
  );
};

export default DirectoriesList;