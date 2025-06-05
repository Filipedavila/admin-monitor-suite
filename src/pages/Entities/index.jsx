import React, {useState} from "react";
import { Button, InputSearch, SortingTable } from "ama-design-system";
import "./style.users.css";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
const EntitiesList = () => {
        
    
    const [data, setData] = useState(dataRows)
    const [checkboxesSelected, setCheckboxesSelected] = useState([])

    return(
    
    <div>
    <h2>Entidades</h2>
    <p>Abaixo encontra a listagem de todas as Entidades registadas no AdminMonitorSuite, num total de 38 diretórios.</p>

    <div className="content">

    <h3>Lista de Entidades</h3>
    <div className="d-flex justify-content-between align-items-center mb-3">
        <span>Filtrar Entidades:</span>
        <InputSearch 
            placeholder={"Pesquisar Entidades..."}
            style={{ width: "87%" }}
            />
    </div>
    <div className="d-flex gap-4 justify-content-end mb-4">
        <Button
            text={"Apagar Entidades"}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={() => console.log("Criar Utilizador")}
        />


    </div>
  <SortingTable
      darkTheme={false ? "dark" : "light"}
      headers={directoriesHeaders}
      setDataList={setData}
      dataList={data}
      columnsOptions={columnsOptions}
      nextPage={() => null}
      caption={"Estatísticas do diretório"+ " " + "Os 25 Portais + Procurados da AP"}
      iconsAltTexts={nameOfIcons}
      paginationButtonsTexts={paginationButtonsTexts}
      project={""}
      setCheckboxesSelected={setCheckboxesSelected}
      />
      </div>
    </div>
)
}

export default EntitiesList;