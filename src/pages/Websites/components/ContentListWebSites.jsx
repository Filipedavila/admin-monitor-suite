import React, { useState } from "react";
import { Button, InputSearch, SortingTable } from "ama-design-system";
import { useTheme } from '../../../context/ThemeContext';
import {
  directoriesHeaders,
  columnsOptions,
  nameOfIcons,
  paginationButtonsTexts,
} from "../table.config";
export default function ContentListWebSites({ checkboxesSelected, setCheckboxesSelected, data, setData }) {
  const { theme } = useTheme();

  return (
    <>
      <h2>Lista de sítios web</h2>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span>Filtrar Sítios Web:</span>
        <InputSearch
          placeholder={"Pesquisar Sítios Web..."}
          style={{ width: "87%" }}
        />
      </div>
      <div className="d-flex gap-4 justify-content-end mb-4">
        <Button
          text={"Apagar Sítios Web"}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={() => console.log("Criar Utilizador")}
        />
        <Button
          text={"Apagar páginas"}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={() => console.log("Criar Utilizador")}
        />
        <Button
          text={"Reavaliar sítios"}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={() => console.log("Criar Utilizador")}
        />
        <Button
          text={"Crawling sítios web"}
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
    </>
  );
}