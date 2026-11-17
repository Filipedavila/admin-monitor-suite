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
export const columnsOptions = (navigate, setCheckboxesSelected) => {
  return {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, 
    onClick: (row) => {
      // Antes usava variáveis fora de âmbito (ReferenceError); agora recebe o setter da página.
      setCheckboxesSelected?.((selected) =>
        selected.some((item) => item.id === row.id) ? selected : [...selected, row]
      );
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
  status: { type: "DangerousHTML", center: true, bold: false, decimalPlace: false },
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
    { type: "Checkbox", bigWidth: "5%", nRow: 1, name: "Importar", property: "id", label: "Importar"},
    { type: "SortingText", bigWidth: "95%", nRow: 1, name: "Páginas", property: "Uri" },
  ]
];

export const columnsOptionsCrawlDetails = {
  id: { type: "Checkbox", center: false, bold: false, decimalPlace: false },
  Uri: { type: "Text", center: false, isCheckboxLabel: true, bold: false, decimalPlace: false },
};



// Icon alt texts and pagination (optional, can be empty or copied from other modules)
export const nameOfIcons = [];
export const paginationButtonsTexts = [];

// Table column property -> backend sort field (sorts[field]=ASC|DESC)
export const sortFields = { status: "status" };
export const sortFieldsCrawlDetails = { Uri: "url" };
