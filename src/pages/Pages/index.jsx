import React, { useState } from "react";
import "./style.users.css";
import {
  dataRows,
} from "./table.config";
import ContentListPages from "./components/ContentListPage";
const PageList = () => {
  const [data, setData] = useState(dataRows);
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);

  return (
    <div>
      <h1>Páginas Web</h1>
      <p>
        Abaixo encontra a listagem de todos os Páginas Web registados no
        AdminMonitorSuite, num total de 38 diretórios.
      </p>

      <div className="content bg-white">
        <h2>Lista de Páginas Web</h2>
        <ContentListPages 
        checkboxesSelected={checkboxesSelected}
        setCheckboxesSelected={setCheckboxesSelected}
        data={data}
        setData={setData}
        />
      </div>
    </div>
  );
};

export default PageList;
