import { useMemo } from "react";
import { Button, InputSearch, SortingTable } from "@a12e/accessmonitor-ds";
import { directoriesHeaders, columnsOptions, nameOfIcons, sortFields } from "../table.config";
import { toServerSortHeaders, MAX_ITEMS_PER_PAGE } from "../../../hooks/useServerSort";
import { useTheme } from "../../../context/ThemeContext";
import { useTranslation } from 'react-i18next';
import { usePermissions } from "../../../context/AuthContext";

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
  useClientSideSorting = false
}){
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { canEdit, canDelete } = usePermissions();
  // Server-side sorting only applies when the server paginates the data
  const serverSort = !useClientSideSorting && Boolean(onSortChange);

  // Issue #60: Filter data by search if client-side sorting is enabled
  const filteredData = useMemo(() => {
    if (!useClientSideSorting || !search) {
      return data;
    }
    const searchLower = search.toLowerCase();
    return data.filter(item =>
      item.Uri?.toLowerCase().includes(searchLower) ||
      item.Score?.toString().includes(searchLower)
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
          <SortingTable
            darkTheme={theme}
            headers={serverSort ? toServerSortHeaders(directoriesHeaders, sortFields) : directoriesHeaders}
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
            totalItems={useClientSideSorting ? filteredData.length : totalItems}
            currentPage={currentPage}
            itemsPerPage={itemsPerPage}
            setItemsPerPage={setItemsPerPage}
            onPageChange={onPageChange}
            onItemsPerPageChange={onItemsPerPageChange}
            onSortChange={serverSort ? onSortChange : undefined}
            maxItemsPerPage={useClientSideSorting ? undefined : MAX_ITEMS_PER_PAGE}
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
            rowKey="id"
          />
          <div className="d-flex gap-4 justify-content-start mt-3">
            {canEdit && (
            <Button
              darkTheme={theme}
              text={"Reavaliar"}
              icon={"AMA-Adicionar-Line"}
              className="btn-primary"
              onClick={handleReevaluatePages}
              disabled={checkboxesSelected.length === 0}
            />
            )}
            {canDelete && (
            <Button
              darkTheme={theme}
              text={t('PAGES_PAGE.LIST.delete_pages')}
              icon={"AMA-Adicionar-Line"}
              className="btn-primary"
              onClick={handleDeletePages}
              disabled={checkboxesSelected.length === 0}
            />
            )}
            {canEdit && (
            <Button
              darkTheme={theme}
              text={"Mostrar/Esconder no observatório"}
              icon={"AMA-Adicionar-Line"}
              className="btn-primary"
              onClick={handleShowHideObservatory}
              disabled={checkboxesSelected.length === 0}
            />
            )}
          </div>
        </div>
  )
}