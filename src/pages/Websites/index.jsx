import React, {useState} from "react";
import { Button, InputSearch, SortingTable } from "ama-design-system";
import "./style.users.css";
import { directoriesHeaders, dataRows, columnsOptions, nameOfIcons, paginationButtonsTexts } from "./table.config.jsx";
const WebSiteList = () => {
        
    
    const [data, setData] = useState(dataRows)
    const [checkboxesSelected, setCheckboxesSelected] = useState([])

    return(
    
    <div>
    <h2>Sítios web</h2>
    <p>Abaixo encontra a listagem de todos os sítios web registados no AdminMonitorSuite, num total de 38 diretórios.</p>

    <div className="content">

    <h3>Lista de sítios web</h3>
    <div className="d-flex justify-content-between align-items-center mb-3">
        <span>Filtrar sítios web:</span>
        <InputSearch 
            placeholder={"Pesquisar sítios web..."}
            style={{ width: "87%" }}
            />
    </div>
    <div className="d-flex gap-4 justify-content-end mb-4">
        <Button
            text={"Apagar sítios web"}
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

export default WebSiteList;