import React, { useState } from "react";
import { Button, InputSearch, SortingTable } from "ama-design-system";
import { useTheme } from '../../../context/ThemeContext';
import {
  directoriesHeaders,
  columnsOptions,
  nameOfIcons,
  paginationButtonsTexts,
} from "../table.config";
import { useTranslation } from "react-i18next";
import i18n from "../../../i18n";

export default function ContentListWebSites({
  title= i18n.t('WEBSITES_PAGE.LIST.title'),
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
  onDeleteWebsites,
  onDeletePagesWebsites,
  onReevaluateWebsites,
  onCrawlWebsites,
  navigate,
  setItemsPerPage,
  serverSidePagination = true,
}) {
  const { t } = useTranslation();
  const { theme } = useTheme();
  return (
    <div className="content bg-white">
      <h2>{title}</h2>
      <div className="d-flex gap-2 align-items-center mb-3">
        <span>{t('MISC.filter')} {t('WEBSITES_PAGE.LIST.title_list')}:</span>
        <InputSearch
          darkTheme={theme}
          label={t('MISC.filter') + ' ' + t('WEBSITES_PAGE.LIST.title_list')}
          placeholder={t('MISC.filter') + ' ' + t('WEBSITES_PAGE.LIST.title_list') + '...'}
          value={search}
          onChange={handleSearchChange}
        />
      </div>
      <div className="d-flex gap-4 justify-content-start mb-4">
        <Button
          darkTheme={theme}
          text={t('WEBSITES_PAGE.LIST.delete_websites')}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={onDeleteWebsites}
          disabled={checkboxesSelected.length === 0}
        />
        <Button
          darkTheme={theme}
          text={t('PAGES_PAGE.LIST.delete_pages')}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={onDeletePagesWebsites}
          disabled={checkboxesSelected.length === 0}
        />
        <Button
          darkTheme={theme}
          text={t('WEBSITES_PAGE.LIST.re_evaluate_websites')}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={onReevaluateWebsites}
          disabled={checkboxesSelected.length === 0}
        />
        <Button
          darkTheme={theme}
          text={t('WEBSITES_PAGE.LIST.crawler')}
          icon={"AMA-Adicionar-Line"}
          className="btn-primary"
          onClick={onCrawlWebsites}
          disabled={checkboxesSelected.length === 0}
        />
      </div>
      <SortingTable
        darkTheme={theme}
        hasColAndRowspan={false}
        headers={directoriesHeaders}
        setDataList={setData}
        dataList={data}
        columnsOptions={columnsOptions(navigate)}
        nextPage={() => null}
        caption={t('WEBSITES_PAGE.LIST.table.title')}
        iconsAltTexts={nameOfIcons}
        project={""}
        setCheckboxesSelected={setCheckboxesSelected}
        checkedItems={checkboxesSelected}
        pagination={true}
        serverSidePagination={serverSidePagination}
        {...(serverSidePagination && {
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
          "Ver",           // see
          "por página",    // per_page
          "Selector de itens por página", // selectorAria
          "Navegação do seletor de itens por página" // selectorNav
        ]}
        itemsPaginationTexts={[
          " de ",    // of
          " itens "  // items
        ]}
        rowKey="WebsiteId"
        paginationOptions={[10, 20, 50, 100, 250, 500, totalItems].filter((v, i, a) => v && a.indexOf(v) === i).sort((a, b) => a - b)}
      />
    </div>
  );
}