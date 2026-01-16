// Table headers for SortingTable
import i18n from "../../i18n";

export const directoriesHeaders = [
  [
    { type: "Hidden", nRow: 1, name: i18n.t('CRAWLER_PAGE.LIST.table.website_label'), property: "websiteId" },
    { type: "Checkbox", nRow: 1, name: i18n.t('CRAWLER_PAGE.LIST.table.select_label'), property: "id", label: i18n.t('CRAWLER_PAGE.LIST.table.select_label') },
    { type: "SortingText", nRow: 1, name: i18n.t('CRAWLER_PAGE.LIST.table.initial_url_label'), property: "url", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('CRAWLER_PAGE.LIST.table.start_date_label'), property: "startDate" },
    { type: "SortingText", nRow: 1, name: i18n.t('CRAWLER_PAGE.LIST.table.status_label'), property: "status" },
    { type: "SortingText", nRow: 1, name: i18n.t('CRAWLER_PAGE.LIST.table.results_label'), property: "results" },
  ]
];

// Column rendering options
export const columnsOptions = (navigate) => {
  return {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, 
    onClick: (row) => {
      setCheckboxesSelected([...checkboxesSelected, row.id]);
    },
  },
  url: { 
    type: "Text", 
    center: true, 
    bold: false, 
    decimalPlace: false, 
    isCheckboxLabel: true, 
  },
  startDate: { type: "Text", center: true, bold: false, decimalPlace: false },
  status: { type: "Text", center: true, bold: false, decimalPlace: false },
  results: {
    type: "Button", text: "Ver", onClick: (row) => {
      navigate(`/dashboard/crawler/details/${row.id}/${row.websiteId}`)
    }, center: false, bold: false, decimalPlace: false
  },
};}

// Mock data
export const dataRows = [
  {
    id: 1,
    url: "https://example.com",
    startDate: "2024-07-01",
    status: "completed",
    results: 42,
  },
  {
    id: 2,
    url: "https://another.com",
    startDate: "2024-07-02",
    status: "running",
    results: 10,
  },
];

export const directoriesHeadersCrawlDetails = [
  [
    { type: "Checkbox", nRow: 1, justifyCenter: true, name: "Importar", property: "Import" },
    { type: "SortingText", nRow: 1, name: "Páginas", property: "Uri" },
  ]
];

export const columnsOptionsCrawlDetails = {
  Import: { type: "Checkbox", center: true, bold: false, decimalPlace: false },
  Uri: { type: "Link", center: false, isCheckboxLabel: true, href: (row) => {
    return `${row.Uri}`
  }, bold: false, decimalPlace: false },
};



// Icon alt texts and pagination (optional, can be empty or copied from other modules)
export const nameOfIcons = [];
export const paginationButtonsTexts = []; 