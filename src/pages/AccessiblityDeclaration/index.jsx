import React, { useState } from "react";
import { Button, SortingTable, Icon, Breadcrumb } from "@a12e/accessmonitor-ds";
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import {
  directoriesHeaders,
  columnsOptions,
  dataRows,
  nameOfIcons,
  paginationButtonsTexts,
  mainColumnsOptions,
  mainTableHeaders,
  mainTableRows,
  Tab2ColumnsOptions,
  Tab2DataRows,
  Tab2Headers,
  estadoDeclaracoesColumnsOptions,
  estadoDeclaracoesHeaders,
  estadoDeclaracoesRows,
  conformidadeDeclaradaColumnsOptions,
  conformidadeDeclaradaHeaders,
  conformidadeDeclaradaRows,
  estadoPorDiretorioHeaders,
  estadoPorDiretorioRows,
  estadoPorDiretorioColumnsOptions,
  estadoPorNivelDiretorioHeaders,
  estadoPorNivelDiretorioRows,
  estadoPorNivelDiretorioColumnsOptions,
  pesoConformidadeOPAWHeaders,
  pesoConformidadeOPAWRows,
  pesoConformidadeOPAWColumnsOptions,
  balancoAvaliacoesHeaders,
  balancoAvaliacoesRows,
  balancoAvaliacoesColumnsOptions
} from "./table.config.jsx";
// Mock data and configs for demonstration


const AccessibilityDeclarationList = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [checkboxesSelected, setCheckboxesSelected] = useState([]);
  const [data, setData] = useState(dataRows);
const breadcrumbs = [
    { children: <Link to="/dashboard/home">Início</Link> },

    {
      title: "Declarações de Acessibilidade",
    }
  ];
  return (
    <div>
                            <Breadcrumb data={breadcrumbs} />
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Declarações de Acessibilidade</h1>

      </div>

      {/* Tabela 1 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Lista de declarações de acessibilidade</h2>
          <div className="d-flex gap-2">

          <Button
            className="btn-primary"
            
            darkTheme={theme}
            text="Actualizar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}
            
            onClick={() => alert("Exportar: Lista de declarações de acessibilidade")}
            />
          <Button
            className="btn-primary"
            
            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}
            
            onClick={() => alert("Exportar: Lista de declarações de acessibilidade")}
            />
            </div>
        </div>
        <SortingTable
          darkTheme={theme}
          headers={mainTableHeaders}
          setDataList={setData}
          dataList={mainTableRows}
          columnsOptions={mainColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      {/* Tabela 2 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Distribuição da idade das declarações de acessibilidade</h2>
          <Button
            className="btn-primary"

            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}

            onClick={() => alert("Exportar: Distribuição da idade das declarações de acessibilidade")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={Tab2Headers}
          setDataList={setData}
          dataList={Tab2DataRows}
          columnsOptions={Tab2ColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      {/* Tabela 3 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Distribuição do estado das declarações de acessibilidade</h2>
          <Button
            className="btn-primary"

            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}

            onClick={() => alert("Exportar: Distribuição do estado das declarações de acessibilidade")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={estadoDeclaracoesHeaders}
          setDataList={setData}
          dataList={estadoDeclaracoesRows}
          columnsOptions={estadoDeclaracoesColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      {/* Tabela 4 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Conformidade declarada</h2>
          <Button
            className="btn-primary"

            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}

            onClick={() => alert("Exportar: Conformidade declarada")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={conformidadeDeclaradaHeaders}
          setDataList={setData}
          dataList={conformidadeDeclaradaRows}
          columnsOptions={conformidadeDeclaradaColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      {/* Tabela 5 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Distribuição do estado das declarações de acessibilidade por diretório</h2>
          <Button
            className="btn-primary"

            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}

            onClick={() => alert("Exportar: Distribuição do estado das declarações de acessibilidade por diretório")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={estadoPorDiretorioHeaders}
          setDataList={setData}
          dataList={estadoPorDiretorioRows}
          columnsOptions={estadoPorDiretorioColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      {/* Tabela 6 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Distribuição do estado das declarações de acessibilidade por nível e por diretório</h2>
          <Button
            className="btn-primary"

            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}

            onClick={() => alert("Exportar: Distribuição do estado das declarações de acessibilidade por nível e por diretório")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={estadoPorNivelDiretorioHeaders}
          setDataList={setData}
          dataList={estadoPorNivelDiretorioRows}
          columnsOptions={estadoPorNivelDiretorioColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      {/* Tabela 7 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0"> Conformidade declarada por diretório</h2>
          <Button
            className="btn-primary"

            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}

            onClick={() => alert("Exportar:  Conformidade declarada por diretório")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={conformidadeDeclaradaHeaders}
          setDataList={setData}
          dataList={conformidadeDeclaradaRows}
          columnsOptions={conformidadeDeclaradaColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      {/* Tabela 8 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Peso da conformidade declarada no total sítios web registados no OPAW, por diretório</h2>
          <Button
            className="btn-primary"

            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}

            onClick={() => alert("Exportar: Peso da conformidade declarada no total sítios web registados no OPAW, por diretório")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={pesoConformidadeOPAWHeaders}
          setDataList={setData}
          dataList={pesoConformidadeOPAWRows}
          columnsOptions={pesoConformidadeOPAWColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>

      {/* Tabela 9 */}
      <div className="content bg-white mb-5 p-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h2 className="mb-0">Balanceamento das avaliações efetuadas</h2>
          <Button
            className="btn-primary"

            darkTheme={theme}
            text="Exportar"
            icon={<Icon name="AMA-DownloadSetacurta-Line" size={16} />}

            onClick={() => alert("Exportar: Balanceamento das avaliações efetuadas")}
          />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={balancoAvaliacoesHeaders}
          setDataList={setData}
          dataList={balancoAvaliacoesRows}
          columnsOptions={balancoAvaliacoesColumnsOptions}
          nextPage={() => null}
          caption={t('ENTITIES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          paginationButtonsTexts={paginationButtonsTexts}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          checkedItems={checkboxesSelected}
        />
      </div>


    </div>
  );
};

export default AccessibilityDeclarationList;
