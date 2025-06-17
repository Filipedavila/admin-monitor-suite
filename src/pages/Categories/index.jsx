import React, { useState } from "react";
import { Button, InputSearch, SortingTable, Breadcrumb } from "ama-design-system";
import "./style.users.css";
import { Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
const CategoriesList = () => {

  const { theme } = useTheme();
  const [data, setData] = useState(dataRows)
  const [checkboxesSelected, setCheckboxesSelected] = useState([])
  const breadcrumbs = [
    { children: <Link to="/">Home</Link> },

    {
      title: "Categorias",
    }
  ];
  return (

    <div>
      <Breadcrumb data={breadcrumbs} />

      <h1>Categorias</h1>
      <p>Abaixo encontra a listagem de todas as Categorias registadas no AdminMonitorSuite, num total de 38 diretórios.</p>

      <div className="content bg-white bg-white">

        <h2>Lista de Categorias</h2>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span>Filtrar Categorias:</span>
          <InputSearch
            placeholder={"Pesquisar Categorias..."}
            style={{ width: "87%" }}
          />
        </div>
        <div className="d-flex gap-4 justify-content-end mb-4">

          <Button
            text={"Reavaliar"}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
          />
          <Button
            text={"Crawling"}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
          />

          <Button
            text={"Apagar Páginas"}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
          />
          <Button
            text={"Apagar Categorias"}
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
  )
}

export default CategoriesList;