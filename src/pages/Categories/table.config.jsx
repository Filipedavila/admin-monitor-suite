import i18n from '../../i18n';
const apiUrl = import.meta.env.VITE_API_URL;

export const categoriesHeaders = [
  [
    {type: "Checkbox", nRow: 2, name: i18n.t('MISC.select'), property: "id", justifyCenter: true},
    {type: "SortingText", nRow: 2, name: i18n.t('CATEGORIES_PAGE.LIST.table.name_label'), property: "name"},
    {type: "SortingText", nRow: 2, name: i18n.t('CATEGORIES_PAGE.LIST.table.websites_label'), property: "numberSites", justifyCenter: true},
  ]
]

export const columnsOptions = {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label: "Selecionar" },
  name: { type: "Link", center: false, bold: false, decimalPlace: false, href: (row) => {
    return `${apiUrl}dashboard/categories/view/${row.name}`
  } },
  numberSites: { type: "Text", center: false, bold: false, decimalPlace: false },
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

export const nItemsPerPageText=[i18n.t('ITEMS_PER_PAGE_LABEL')]

export const itemsPaginationText = [i18n.t('RANGE_PAGE_LABEL_1'), i18n.t('RANGE_PAGE_LABEL_2')]

const generateAccessibleId = (name) => {
  // Convert name to lowercase and replace spaces with hyphens
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add timestamp for uniqueness
  return `category-${sanitizedName}`;
};

export const dataRows = [
  {
    id: generateAccessibleId("Portal Mais Transparência"),
    name: "Portal Mais Transparência",
    numberSites: "12",
  },
  {
    id: generateAccessibleId("Instituto da Segurança Social"),
    name: "Instituto da Segurança Social, I.P. - Portal Seg Social com o <title>",
    numberSites: "24",
  },
  {
    id: generateAccessibleId("Portal do SNS 24"),
    name: "Portal do SNS 24",
    numberSites: "23",
  },
  {
    id: generateAccessibleId("Comissão Nacional de Eleições"),
    name: "Comissão Nacional de Eleições",
    numberSites: "64",
  }
]

export const options = [
  {
    id: "1",
    title:
      "I found 1 image on the page without the alternative text equivalent.",
    component: (
      <div>
        Check if the alternative text equivalent found in the images provides
        equal information or function as the one performed by the image on the
        page. H37: Using alt attributes on img elements This WCAG 2.1
        technique is related to: Success criteria 1.1.1 (Level A) Notions
        about the SC 1.1.1
      </div>
    ),
    lvl: "AA",
    iconName: "AMA-Middle-Line",
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
