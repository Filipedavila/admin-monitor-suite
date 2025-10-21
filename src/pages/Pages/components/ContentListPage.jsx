import React, { useState } from "react";
import { Button, InputSearch, SortingTable } from "ama-design-system";
import {
  directoriesHeaders,
  dataRows,
  columnsOptions,
  nameOfIcons,
  paginationButtonsTexts,
} from "../table.config";
import { useTheme } from "../../../context/ThemeContext";
import { useTranslation } from 'react-i18next';

export default function ContentListPages ({ 
  checkboxesSelected, 
  setCheckboxesSelected, 
  data, 
  setData,
  totalItems,
  currentPage,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  search,
  handleSearchChange,
  handleDeletePages,
  handleReevaluatePages,
  handleShowHideObservatory
}){
  const { theme } = useTheme();
  const { t } = useTranslation();
  return(
     <div>

        <div className="d-flex  gap-2 align-items-center mb-3">
          <span>{t('MISC.filter')} {t('PAGES_PAGE.LIST.title')}:</span>
          <InputSearch
            darkTheme={theme}
            placeholder={t('MISC.filter') + ' ' + t('PAGES_PAGE.LIST.title') + '...'}
            label={t('MISC.filter') + ' ' + t('PAGES_PAGE.LIST.title')}
            value={search}
            onChange={handleSearchChange}
            />
        </div>
        <div className="d-flex gap-4 justify-content-start mb-4">
          <Button
            darkTheme={theme}
            text={"Reavaliar"}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleReevaluatePages}
            disabled={checkboxesSelected.length === 0}
            />
          <Button
            darkTheme={theme}
            text={t('PAGES_PAGE.LIST.delete_pages')}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleDeletePages}
            disabled={checkboxesSelected.length === 0}
            />
          <Button
            darkTheme={theme}
            text={"Mostrar/Esconder no observatório"}
            icon={"AMA-Adicionar-Line"}
            className="btn-primary"
            onClick={handleShowHideObservatory}
            disabled={checkboxesSelected.length === 0}
            />
        </div>
        <SortingTable
          darkTheme={theme}
          headers={directoriesHeaders}
          setDataList={setData}
          dataList={data}
          columnsOptions={columnsOptions}
          nextPage={() => null}
          caption={t('PAGES_PAGE.LIST.table.title')}
          iconsAltTexts={nameOfIcons}
          project={""}
          setCheckboxesSelected={setCheckboxesSelected}
          pagination={true}
          totalItems={totalItems}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
          onItemsPerPageChange={onItemsPerPageChange}
          paginationButtonsTexts={[
            "Primeira página",
            "Página anterior",
            "Página seguinte",
            "Última página"
          ]}
          nItemsPerPageTexts={[
            "Ver",           // see
            "por página",    // per_page
            "Selector de itens por página", // selectorAria
            "Navegação do seletor de itens por página" // selectorNav
          ]}
          itemsPaginationTexts={[
            " de ",    // of
            " itens "  // items
          ]}
          paginationOptions={[50, 100, 250, 500]}
        />
          </div>
  )
}