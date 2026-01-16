import i18n from '../../i18n';
import { useNavigate } from 'react-router-dom';
const apiUrl = import.meta.env.VITE_API_URL + import.meta.env.VITE_ROUTE_URL;

export const categoriesHeaders = [
  [
    {type: "Checkbox", nRow: 1, name: i18n.t('MISC.select'), property: "id", justifyCenter: true},
    {type: "SortingText", nRow: 1, name: i18n.t('CATEGORIES_PAGE.LIST.table.name_label'), property: "Name"},
    {type: "SortingText", nRow: 1, name: i18n.t('CATEGORIES_PAGE.LIST.table.websites_label'), property: "Websites", justifyCenter: true},
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.edit_label'), property: "edit", justifyCenter: true },

  ]
]

export const columnsOptions = (navigate)=>({
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label: "Selecionar" },
  Name: { type: "Link", 
    center: false, 
    bold: false, 
    decimalPlace: false,
    isCheckboxLabel: true,
    href: (row) => {
    return `${apiUrl}dashboard/categories/view/${row.Name}`
  } },
  Websites: { type: "Text", center: false, bold: false, decimalPlace: false },
  edit: { type: "Button",text:i18n.t('USERS_PAGE.LIST.table.edit_label'), onClick: (row)=>{ 
    navigate(`${import.meta.env.VITE_ROUTE_URL}dashboard/categories/edit/${row.id}`)
  }, center: true, bold: false, decimalPlace: false },
 })


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
    Name: "Portal Mais Transparência",
    Websites: "12",
  },
  {
    id: generateAccessibleId("Instituto da Segurança Social"),
    Name: "Instituto da Segurança Social, I.P. - Portal Seg Social com o <title>",
    Websites: "24",
  },
  {
    id: generateAccessibleId("Portal do SNS 24"),
    Name: "Portal do SNS 24",
    Websites: "23",
  },
  {
    id: generateAccessibleId("Comissão Nacional de Eleições"),
    Name: "Comissão Nacional de Eleições",
    Websites: "64",
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
    { type: "Text", nRow: 1, bigWidth: "50%", name: i18n.t("WEBSITES_PAGE.table_best_practices.practice_label"), property: "practice" },
    { type: "Text", nRow: 1, name: i18n.t("WEBSITES_PAGE.table_best_practices.n_pages_label"), justifyCenter: true, property: "pages" },
    { type: "Text", nRow: 1, name: i18n.t("WEBSITES_PAGE.table_best_practices.n_errors_label"), justifyCenter: true, property: "occurrences" },
    { type: "Text", nRow: 1, name: i18n.t("WEBSITES_PAGE.table_best_practices.lvl_label"), justifyCenter: true, property: "level" },

  ]
]

  export const columnsOptionsDetails = {
    practice: { type: "DangerousHTML", center: false, bold: false, decimalPlace: false, property: "pratice" },
    pages: { type: "Number", center: true, bold: false, decimalPlace: false, property: "pages" },
    occurrences: { type: "Number", center: true, bold: false, decimalPlace: false, property: "occurrences" },
    level: { type: "Text", center: true, bold: false, decimalPlace: false, ariaLabel: true, property: "level" },
  }

  export const ariaLabels = {
    "A": i18n.t("WEBSITES_PAGE.ariaLabels.A"),
    "AA": i18n.t("WEBSITES_PAGE.ariaLabels.AA"),
    "AAA": i18n.t("WEBSITES_PAGE.ariaLabels.AAA")
  }

 export const detailsTable = [
        {
            "practices": "Verifiquei que todas as ligações têm nome acessível.",
           
            "pages": 42,
            "occurrences": 5471,
            "level": "AA",
        },
        {
            "practices": "Encontrei um elemento com a semântica de banner.",
          
            "pages": 42,
            "occurrences": 1402,
            "level": "AA",
        }
    ]
