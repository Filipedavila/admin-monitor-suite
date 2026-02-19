import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
import { useSyncCheckboxVisuals } from "../../../hooks/useSyncCheckboxVisuals";

export default function ContentListPages ({ 
  checkboxesSelected, 
  setCheckboxesSelected, 
  data, 
  setData,
  totalItems,
  currentPage,
  itemsPerPage,
  setItemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  search,
  handleSearchChange,
  handleDeletePages,
  handleReevaluatePages,
  handleShowHideObservatory,
  onSortChange,
  sortField = '',
  sortDirection = '',
  useClientSideSorting = false // Issue #60: Use client-side sorting for all data
}){
  const { theme } = useTheme();
  const { t } = useTranslation();
  
  // Fix for Issue #64 - sync checkbox visuals when dealing with duplicate URIs
  useSyncCheckboxVisuals(checkboxesSelected, data, 'id', 'table');
  
  // Issue #60: Filter data by search if client-side sorting is enabled
  const filteredData = useMemo(() => {
    if (!useClientSideSorting || !search) {
      return data;
    }
    const searchLower = search.toLowerCase();
    return data.filter(item => 
      item.Uri?.toLowerCase().includes(searchLower) ||
      item.Score?.toString().includes(searchLower) ||
      item.Element_Count?.toString().includes(searchLower)
    );
  }, [data, search, useClientSideSorting]);
  
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
            dataList={useClientSideSorting ? filteredData : data}
            columnsOptions={columnsOptions}
            nextPage={() => null}
            caption={t('PAGES_PAGE.LIST.table.title')}
            iconsAltTexts={nameOfIcons}
            project={""}
            setCheckboxesSelected={setCheckboxesSelected}
            checkedItems={checkboxesSelected}
            pagination={true}
            serverSidePagination={!useClientSideSorting}
            {...(!useClientSideSorting && {
              totalItems,
              currentPage,
              itemsPerPage,
              onPageChange,
              onItemsPerPageChange,
              setItemsPerPage
            })}
            paginationButtonsTexts={[
              "Primeira página",
              "Página anterior",
              "Página seguinte",
              "Última página"
            ]}
            nItemsPerPageTexts={[
              "Ver",
              "por página",
              "Selector de itens por página",
              "Navegação do seletor de itens por página"
            ]}
            itemsPaginationTexts={[
              " de ",
              " itens "
            ]}
            paginationOptions={[10, 25, 50, 100, totalItems].filter((v, i, a) => v && a.indexOf(v) === i).sort((a, b) => a - b)}
            rowKey="id"
          />
        </div>
  )
}