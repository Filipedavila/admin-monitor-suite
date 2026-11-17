import { Link } from "react-router-dom";
import i18n from '../../i18n';

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 1, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.username_label'), property: "Username" },
    { type: "SortingText", nRow: 1, name: "Aplicação", property: "Aplicacao", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: "Perfil", property: "Perfil", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: "Equipas", property: "Equipas", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: "Sítios Web", property: "SitiosWeb", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.edit_label'), property: "edit", justifyCenter: true },
  ],
];

export const columnsOptions = (navigate)=>({
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false },
  Username: {
    type: "Text",
    center: true,
    bold: true,
    decimalPlace: false,
    children: (row, value) => {
      if (row.Aplicacao === "MONITOR") {
        return (
          <Link to={`/dashboard/users/websites/${row.Username}`} className="ama-typography-body bold">
            {value}
          </Link>
        )
      } else{
        return (
          <label htmlFor={'checkbox_' + row.id} className="ama-typography-body bold">
            {value}
        </label>
      )
    }
    }
  },
  Aplicacao: { type: "Text", center: true, bold: false, decimalPlace: false },
  Perfil: { type: "Text", center: true, bold: false, decimalPlace: false },
  Equipas: { type: "Text", center: true, bold: false, decimalPlace: false },
  SitiosWeb: { type: "Text", center: true, bold: false, decimalPlace: false },
  edit: { type: "Button", text: i18n.t('USERS_PAGE.LIST.table.edit_label'), onClick: (row) => { navigate(`/dashboard/users/edit/${row.id}`) }, center: true, bold: false, decimalPlace: false },
});

export const dataRows = [
  {
    id: 1,
    Username: "Joana Costa",
    Type: "MyMonitor",
    Websites: 4,
    Register_Date: "2023-11-01",
    Last_Login: "2024-10-25",
    edit: i18n.t('USERS_PAGE.LIST.table.edit_label'),
  },
];

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


export const websiteUsersHeaders = [
  [
    
    { type: "Skip", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.username_label'), property: "id", justifyCenter: false },
    { type: "Skip", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.username_label'), property: "Username", justifyCenter: false },
    { type: "SortingText", nRow: 1, name: i18n.t('WEBSITES_PAGE.LIST.table.name_label'), property: "Name", justifyCenter: false, bigWidth: "40%" },
    { type: "SortingText", nRow: 1, name: i18n.t('WEBSITES_PAGE.LIST.table.creation_label'), property: "Creation_Date", justifyCenter: false },
    { type: "SortingText", nRow: 1, name: i18n.t('WEBSITES_PAGE.LIST.table.import'), property: "import", justifyCenter: false },
  ],
];

export const websiteUsersColumnsOptions = (navigate, handleImportWebsite)=>({
  Username: { type: "Skip", center: false, bold: false, decimalPlace: false },
  id: { type: "Skip", center: false, bold: false, decimalPlace: false },
  StartingUrl: { type: "Skip", center: false, bold: false, decimalPlace: false },
  Name: { type: "Link", center: false, bold: false, decimalPlace: false,
   href: (row)=>`${import.meta.env.VITE_ROUTE_URL.replace(/\/$/, "")}/dashboard/users/websites/pages/${row.Username}/${row.Name}` },
  Creation_Date: { type: "Text", center: true, bold: false, decimalPlace: false},
  import: { type: "Button",text:i18n.t('WEBSITES_PAGE.LIST.table.import'), onClick: (row)=>{ 
    handleImportWebsite(row);
  }, center: true, bold: false, decimalPlace: false },
});


export const pagesUsersHeaders = [
  [
    { type: "Skip", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.username_label'), property: "id", justifyCenter: true },
    { type: "Skip", nRow: 1, name: i18n.t('WEBSITES_PAGE.LIST.table.name_label'), property: "ShowIn", justifyCenter: true },
    { type: "Skip", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.username_label'), property: "Username", justifyCenter: true },
    { type: "Skip", nRow: 1, name: i18n.t('WEBSITES_PAGE.LIST.table.name_label'), property: "Name", justifyCenter: true },
    { type: "SortingText", nRow: 1,  bigWidth: "40%", name: i18n.t('WEBSITES_PAGE.LIST.table.name_label'), property: "Url", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('PAGES_PAGE.LIST.table.score_label'), property: "Score", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('PAGES_PAGE.LIST.table.last_updated_label'), property: "Evaluation_Date", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('WEBSITES_PAGE.LIST.table.import'), property: "import", justifyCenter: true },
  ],
];

export const pagesUsersColumnsOptions = (navigate, handleImportPage)=>({
  id: { type: "Skip", center: false, bold: false, decimalPlace: false },
  ShowIn: { type: "Skip", center: false, bold: false, decimalPlace: false },
  Username: { type: "Skip", center: false, bold: false, decimalPlace: false },
  Name: { type: "Skip", center: false, bold: false, decimalPlace: false },
  Url: { type:  "Link" , bigWidth: "50%", center: false, bold: false, decimalPlace: false, href: (row)=>`/ams/dashboard/users/websites/pages/details/${row.id}/${row.Username}/${row.Name}/${encodeURIComponent(row.Url)}` },
  Score: { type: "Text", center: true, bold: false, decimalPlace: false },
  Evaluation_Date: { type: "Text", center: true, bold: false, decimalPlace: false },
  import: { 
    type: "Button", 
    text: "Importar", 
    onClick: (row) => {
        handleImportPage(row);
    }, 
    center: true, 
    bold: false, 
    decimalPlace: false 
  },
});

// Table column property -> backend sort field (sorts[field]=ASC|DESC)
export const sortFields = { Username: "username", Aplicacao: "role" };
