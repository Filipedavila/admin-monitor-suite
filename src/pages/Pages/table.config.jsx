import i18n from '../../i18n';
const apiUrl = import.meta.env.VITE_API_URL + import.meta.env.VITE_ROUTE_URL.replace(/\/$/, "") + "/";

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 2, center: true, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 2, center: true, name: "Url", property: "Uri" },
    { type: "SortingText", nRow: 2, center: true, name: "Pontuação", property: "Score", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: "Última avaliação", property: "LastEvaluation", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: "Nº de elementos", property: "ElementCount", justifyCenter: true },
    { type: "Text", nCol: 3, center: true, name: "Nº de Erros", property: "", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: "E", property: "EvaluationStatus", justifyCenter: true },
    { type: "SortingText", nRow: 2, center: true, name: "Observatório", property: "OPAW", justifyCenter: true },
  ],
  [
    { type: "SortingText", center: true, name: "A", property: "A", justifyCenter: true },
    { type: "SortingText", center: true, name: "AA", property: "AA", justifyCenter: true },
    { type: "SortingText", center: true, name: "AAA", property: "AAA", justifyCenter: true },
  ],
];

export const columnsOptions = {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label: "Selecionar" },
  Uri: { type: "Link", center: false, bold: false, decimalPlace: false, isCheckboxLabel: true, href: (row) => apiUrl + "dashboard/pages/view/" + encodeURIComponent(row.Uri) },
  Score: { type: "Text", center: true, bold: false, decimalPlace: true },
  LastEvaluation: { type: "Text", center: true, bold: false, decimalPlace: false },
  ElementCount: { type: "Text", center: true, bold: false, decimalPlace: false },
  A: { type: "Text", center: true, bold: false, decimalPlace: false },
  AA: { type: "Text", center: true, bold: false, decimalPlace: false },
  AAA: { type: "Text", center: true, bold: false, decimalPlace: false },
  EvaluationStatus: { type: "DangerousHTML", center: true, bold: false, decimalPlace: false },
  OPAW: { type: "Text", center: true, bold: false, decimalPlace: false, label: "Observatório" },
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
    navigate(`/dashboard/pages/details/${encodeURIComponent(url)}/${row.id}`)
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

// Table column property -> backend sort field (sorts[field]=ASC|DESC)
export const sortFields = { Uri: "url", Score: "score" };
