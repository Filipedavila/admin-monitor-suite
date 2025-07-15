import i18n from '../../i18n';
const apiUrl = import.meta.env.VITE_API_URL;

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 2,center:true, name: i18n.t('MISC.rank'), property: "id" },
    { type: "SortingText", nRow: 2, center: true, name: i18n.t('DIRECTORIES_PAGE.LIST.table.name_label'), property: "name", justifyCenter: false },
    { type: "SortingText", nRow: 2,  center: true, name: i18n.t('DIRECTORIES_PAGE.LIST.table.type_label'), property: "type", justifyCenter: true },
  ]
]

export const columnsOptions = {
  id: { type: "Checkbox", center: false, bold: false, decimalPlace: false },
  name: {
    type: "Link", center: false, bold: false, decimalPlace: false, href: (row) => {
      return `${apiUrl}dashboard/directories/view/${row.name}`
    }
  },
  type: { type: "Text", center: true, bold: false, decimalPlace: true },
}

export const nameOfIcons = [
  "Selo Bronze",
  "Selo Prata",
  "Selo Ouro",
  "Declaração não conforme",
  "Declaração parcialmente conforme",
  "Declaração plenamente conforme"
]

export const paginationButtonsTexts = [
  i18n.t('FIRST_PAGE_LABEL'),
  i18n.t('PREVIOUS_PAGE_LABEL'),
  i18n.t('NEXT_PAGE_LABEL'),
  i18n.t('LAST_PAGE_LABEL'),
]

export const nItemsPerPageText = [i18n.t('ITEMS_PER_PAGE_LABEL')]

export const itemsPaginationText = [i18n.t('RANGE_PAGE_LABEL_1'), i18n.t('RANGE_PAGE_LABEL_2')]

export const dataRows = [
  {
    "id": 22,
    "name": "Portal Mais Transparência",
    "type": "MyMonitor",
  },
  {
    "id": 23,
    "name": "Instituto da Segurança Social, I.P. - Portal Seg Social com o <title>",
    "type": "MyMonitor",
  },
  {
    "id": 31,
    "name": "Portal do SNS 24",
    "type": "AcessMonitor",
  },
  {
    "id": 25,
    "name": "Comissão Nacional de Eleições",
    "type": "AcessMonitor",
  }
]

export const optionsNormalTable = [
  {
    id: "1",
    title:
      "I found 1 image on the page without the alternative text equivalent.",
    lvl: "AA",
    ele: "test",
    tdClassName: "warning-cell"
  },
];


 export const detailsTableHeaders = [
  [
    { type: "Text", nRow: 1, bigWidth: "50%", name: i18n.t("WEBSITES_PAGE.table_best_practices.practice_label"), property: "practices" },
    { type: "Text", nRow: 1, bigWidth: "30%", name: i18n.t("WEBSITES_PAGE.table_best_practices.details_practice_label"), justifyCenter: true, property: "practicesPerPage" },
    { type: "Text", nRow: 1, name: i18n.t("WEBSITES_PAGE.table_best_practices.n_pages_label"), justifyCenter: true, property: "pages" },
    { type: "Text", nRow: 1, name: i18n.t("WEBSITES_PAGE.table_best_practices.n_errors_label"), justifyCenter: true, property: "occurences" },
    { type: "Text", nRow: 1, name: i18n.t("WEBSITES_PAGE.table_best_practices.lvl_label"), justifyCenter: true, property: "lvl" },
  ]
]

  export const columnsOptionsDetails = {
    practices: { type: "DangerousHTML", center: false, bold: false, decimalPlace: false, property: "name" },
    practicesPerPage: { type: "MultiText", center: true, bold: false, decimalPlace: false, property: "practicesPerPage" },
    pages: { type: "Number", center: true, bold: false, decimalPlace: false, property: "pages" },
    occurences: { type: "Number", center: true, bold: false, decimalPlace: false, property: "occurences" },
    lvl: { type: "Text", center: true, bold: false, decimalPlace: false, ariaLabel: true, property: "lvl" },
  }

  export const ariaLabels = {
    "A": i18n.t("WEBSITES_PAGE.ariaLabels.A"),
    "AA": i18n.t("WEBSITES_PAGE.ariaLabels.AA"),
    "AAA": i18n.t("WEBSITES_PAGE.ariaLabels.AAA")
  }

 export const detailsTable = [
        {
            "practices": "Verifiquei que todas as ligações têm nome acessível.",
            "practicesPerPage": [
                "de 28 a 77 ocorrências em 12 páginas",
                "de 78 a 83 ocorrências em 9 páginas",
                "de 84 a 97 ocorrências em 9 páginas"
            ],
            "pages": 42,
            "occurences": 5471,
            "lvl": "AA",
        },
        {
            "practices": "Encontrei um elemento com a semântica de banner.",
            "practicesPerPage": [
                "de 28 a 77 ocorrências em 12 páginas",
                "de 78 a 83 ocorrências em 9 páginas",
                "de 84 a 97 ocorrências em 9 páginas"
            ],
            "pages": 42,
            "occurences": 1402,
            "lvl": "AA",
        }
    ]
