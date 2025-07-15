import i18n from '../../i18n';
const apiUrl = import.meta.env.VITE_API_URL;

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 2,center: true, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.url_label'), property: "url" },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.score_label'), property: "point", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.last_updated_label'), property: "lastavaliation", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('WEBSITES_PAGE.LIST.table.elements_label'), property: "elementsNumber", justifyCenter: true },
    { id: "conformidade", type: "Text", name: "Nº de Erros", property: "", justifyCenter: true, multiCol: true, nCol: 3 },
    { type: "SortingText", nRow: 2, center: true, name: "E", property: "e", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: "OPAW", property: "OPAW", justifyCenter: true, label: "OPAW" },
  ],
  [
    { id: "a", type: "SortingText", name:"A", property: "a", justifyCenter: true },
    { id: "aa", type: "SortingText", name: "AA", property: "aa", justifyCenter: true },
    { id: "aaa", type: "SortingText", name: "AAA", property: "aaa", justifyCenter: true },
  ],
];

export const columnsOptions = {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label:"Selecionar"},
  url: { type: "Link", center: true, bold: false, decimalPlace: false, href: (row) => apiUrl + "dashboard/pages/view/" + row.title },
  point: { type: "Text", center: true, bold: false, decimalPlace: true },
  lastavaliation: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  e: { type: "Text", center: true, bold: false, decimalPlace: false },
  a: { type: "Number", center: true, bold: false, decimalPlace: false, headers: "conformidade A" },
  aa: { type: "Number", center: true, bold: false, decimalPlace: false, headers: "conformidade AA" },
  aaa: { type: "Number", center: true, bold: false, decimalPlace: false, headers: "conformidade AAA" },
  elementsNumber: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  OPAW: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label:"OPAW"},
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
    url: "exemplo.pt",
    point: "82.5",
    lastavaliation: "05/06/2025",
    elementsNumber: 134,
    a: 10,
    aa: 8,
    aaa: 5,
    e: "?",
    OPAW: "",
  },
  {
    id: "2",
    url: "exemplo.pt",
    point: "82.5",
    lastavaliation: "05/06/2025",
    elementsNumber: 134,
    a: 10,
    aa: 8,
    aaa: 5,
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
    { type: "Checkbox", nRow: 2, name: "rank ", property: "title" },
    { type: "SortingText", nRow: 2, name: "Data avaliação ", property: "date_avaliation" },
    {
      type: "SortingText",
      nRow: 2,
      name: "Pontuação",
      property: "point",
      justifyCenter: true,
    },

    {
      type: "SortingText",
      nRow: 2,
      name: "Elementos HTML",
      property: "elementsNumber",
      justifyCenter: true,
    },

    {
      type: "SortingText",
      nRow: 2,
      name: "A",
      property: "a",
      justifyCenter: true,
    },

    {
      type: "SortingText",
      nRow: 2,
      name: "AA",
      property: "aa",
      justifyCenter: true,
    },

    {
      type: "SortingText",
      nRow: 2,
      name: "AAA",
      property: "aaa",
      justifyCenter: true,
    },
    {
      type: "SortingText",
      nRow: 2,
      name: "E",
      property: "e",
      justifyCenter: true,
    },
    {
      type: "SortingText",
      nRow: 2,
      name: "Ver relatório",
      property: "state",
      justifyCenter: true,
    },
  ],
];

export const columnsOptionsPage = {
  title: { type: "Text", center: false, bold: false, decimalPlace: false }, // Checkbox
  date_avaliation: { type: "Text", center: false, bold: false, decimalPlace: false },
  point: { type: "Text", center: true, bold: false, decimalPlace: true },

  elementsNumber: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  e: { type: "Text", center: true, bold: false, decimalPlace: false },
  a: { type: "Text", center: true, bold: false, decimalPlace: false },
  aa: { type: "Text", center: true, bold: false, decimalPlace: false },
  aaa: { type: "Text", center: true, bold: false, decimalPlace: false },
  state: { type: "Link", center: true, bold: false, decimalPlace: false },
  id: { type: "Checkbox", center: false, bold: false, decimalPlace: false },
};




export const dataRowsPage = [
  {
    title: "",
    date_avaliation: "05/06/2025",
    point: "8.5",
    elementsNumber: 134,
    e: "?",
    a: 10,
    aa: 8,
    aaa: 5,
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

