import i18n from '../../i18n';
const apiUrl = import.meta.env.VITE_API_URL + "/";

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 1,center: true, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 1, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.url_label'), property: "Url" },
    { type: "SortingText", nRow: 1, center: true, name: "Descrição do Erro", property: "Error"},
    { type: "SortingText", nRow: 1, center: true, name: " Adicionada para avaliação ", property: "CreatedAt" },
    { type: "Empty", nRow: 1, center: true, name: "Página", property: "PageId" },
  ],
];

export const columnsOptions = {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label:"Selecionar"},
  Error: {
    type: "Text",
    bold: false,
    decimalPlace: false,
    isCheckboxLabel: true,
  },
  Url: { type: "Link", bold: false, decimalPlace: false, href: (row) => apiUrl + "dashboard/pages/view/" + encodeURIComponent(row.Url) },
  CreatedAt: { type: "Text",  bold: false, decimalPlace: true },
  PageId: { type: "Empty", center: true, bold: false, decimalPlace: false, label:"Página"},
 
};

export const nameOfIcons = [
  "Declaração não conforme",
];

export const paginationButtonsTexts = [
  i18n.t('FIRST_PAGE_LABEL'),
  i18n.t('PREVIOUS_PAGE_LABEL'),
  i18n.t('NEXT_PAGE_LABEL'),
  i18n.t('LAST_PAGE_LABEL'),
];

export const nItemsPerPageText = [i18n.t('ITEMS_PER_PAGE_LABEL')];

export const itemsPaginationText = [i18n.t('RANGE_PAGE_LABEL_1'), i18n.t('RANGE_PAGE_LABEL_2')];

export const dataRows = [
  {
    id: "1",
    Url: "exemplo.pt",
    CreatedAt: "05/06/2025",
    UpdatedAt: "05/06/2025",
    Error: 134,
    id: "1",
  },
  {
    id: "2",
    Url: "exemplo.pt",
    CreatedAt: "05/06/2025",
    UpdatedAt: "05/06/2025",
    Error: 134,
    id: "1",
  },
];
