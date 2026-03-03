import { ceil } from 'lodash';
import i18n from '../../i18n';
const apiUrl = import.meta.env.VITE_API_URL + "/";

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 2,center: true, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.url_label'), property: "Uri" },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.score_label'), property: "Score", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.last_updated_label'), property: "Evaluation_Date", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.elements_label'), property: "Element_Count", justifyCenter: true },
    { id: "conformidade", type: "Text", name: "Nº de Erros", property: "", justifyCenter: true, multiCol: true, nCol: 3 },
    { type: "SortingText", nRow: 2, center: true, name: "E", property: "e", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: "Observatório", property: "OPAW", justifyCenter: true, label: "Observatório" },
  ],
  [
    { id: "a", type: "SortingText", name:"A", property: "A", justifyCenter: true },
    { id: "aa", type: "SortingText", name: "AA", property: "AA", justifyCenter: true },
    { id: "aaa", type: "SortingText", name: "AAA", property: "AAA", justifyCenter: true },
  ],
];

export const columnsOptions = {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label:"Selecionar"},
  Uri: { type: "Link", center: false, bold: false, decimalPlace: false, isCheckboxLabel: true, href: (row) => apiUrl + "dashboard/pages/view/" + encodeURIComponent(row.Uri) },
  Score: { type: "Text", center: true, bold: false, decimalPlace: true },
  Evaluation_Date: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  e: { type: "Text", center: true, bold: false, decimalPlace: false },
  A: { type: "Text", center: true, bold: false, decimalPlace: false, headers: "conformidade A" },
  AA: { type: "Text", center: true, bold: false, decimalPlace: false, headers: "conformidade AA" },
  AAA: { type: "Text", center: true, bold: false, decimalPlace: false, headers: "conformidade AAA" },
  Element_Count: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  OPAW: { type: "Text", center: true, bold: false, decimalPlace: false, label:"Observatório"},
};

export const nameOfIcons = [
  "Selo Bronze",
  "Selo Prata",
  "Selo Ouro",
  "Declaração não conforme",
  "Declaração parcialmente conforme",
  "Declaração plenamente conforme",
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
    Uri: "exemplo.pt",
    Score: "82.5",
    Evaluation_Date: "05/06/2025",
    Element_Count: 134,
    A: 10,
    AA: 8,
    AAA: 5,
    e: "?",
    OPAW: "",
  },
  {
    id: "2",
    Uri: "exemplo.pt",
    Score: "82.5",
    Evaluation_Date: "05/06/2025",
    Element_Count: 134,
    A: 10,
    AA: 8,
    AAA: 5,
    e: "?",
    OPAW: "",
  },
];

export const options = [
  {
    id: "1",
    title:
      "I found 1 image on the page without the alternative text equivalent.",
    component: (
      <div>
        Check if the alternative text equivalent found in the images provides
        equal information or function as the one performed by the image on the
        page. H37: Using alt attributes on img elements This WCAG 2.1 technique
        is related to: Success criteria 1.1.1 (Level A) Notions about the SC
        1.1.1
      </div>
    ),
    lvl: "AA",
    iconName: "AMA-Middle-Line",
    ele: "test",
    tdClassName: "warning-cell",
  },
];


export const directoriesHeadersPage = [
  [
    { type: "Checkbox", nRow: 1, name: "rank ", property: "id", justifyCenter: true, center: true },
    { type: "SortingText", nRow: 1, name: "Data Avaliação ", property: "date_avaliation", justifyCenter: false, center: false },
    {
      type: "SortingText",
      nRow: 1,
      name: "Pontuação",
      property: "score",
      justifyCenter: true,
    },

    {
      type: "SortingText",
      nRow: 1,
      name: "Elementos HTML",
      property: "elementsNumber",
      justifyCenter: true,
    },

    {
      type: "SortingText",
      nRow: 1,
      name: "A",
      property: "A",
      justifyCenter: false,
    },

    {
      type: "SortingText",
      nRow: 1,
      name: "AA",
      property: "AA",
      justifyCenter: true,
    },

    {
      type: "SortingText",
      nRow: 1,
      name: "AAA",
      property: "AAA",
      justifyCenter: true,
    },
    {
      type: "SortingText",
      nRow: 1,
      name: "Ver relatório",
      property: "state",
      justifyCenter: true,
    },
  ],
];

export const columnsOptionsPage = (navigate, url)=>({
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false }, // Checkbox
  date_avaliation: { type: "Text", center: true, bold: false, decimalPlace: false, isCheckboxLabel: true },
  score: { type: "Text", center: true, bold: false, decimalPlace: false },
  elementsNumber: { type: "Text", center: true, bold: false, decimalPlace: false },
  A: { type: "Text", center: true, bold: false, decimalPlace: false },
  AA: { type: "Text", center: true, bold: false, decimalPlace: false },
  AAA: { type: "Text", center: true, bold: false, decimalPlace: false },
  state: { type: "Button", text: "Relatório", center: true, bold: false, decimalPlace: false, onClick: (row)=>{ 
    if(row.id === 0){
      return;
    }
    navigate(`${import.meta.env.VITE_ROUTE_URL}dashboard/pages/details/${encodeURIComponent(url)}/${row.id}`) 
  }},
})



export const dataRowsPage = [
  {
    id: 0,
    date_avaliation: "05/06/2025",
    score: "8.5",
    elementsNumber: 134,
    A: 10,
    AA: 8,
    AAA: 5,
    state: "Relatório",
  },
];

export const optionsPage = [
  {
    id: "1",
    title:
      "I found 1 image on the page without the alternative text equivalent.",
    component: (
      <div>
        Check if the alternative text equivalent found in the images provides
        equal information or function as the one performed by the image on the
        page. H37: Using alt attributes on img elements This WCAG 2.1 technique
        is related to: Success criteria 1.1.1 (Level A) Notions about the SC
        1.1.1
      </div>
    ),
    lvl: "AA",
    iconName: "AMA-Middle-Line",
    ele: "test",
    tdClassName: "warning-cell",
  },
];

