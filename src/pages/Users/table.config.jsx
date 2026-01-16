import i18n from '../../i18n';

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 1, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.username_label'), property: "Username" },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.app_label'), property: "Type" },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.websites_label'), property: "Websites", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.last_login_label'), property: "Last_Login", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.register_label'), property: "Register_Date", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.edit_label'), property: "edit", justifyCenter: true },
  ],
];

export const columnsOptions = (navigate)=>({
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, 
   },
  Username: {
    type: "Link",
    center: true,
    bold: false,
    decimalPlace: false,
    isCheckboxLabel: true,
    href: (row) => (row.Type === "MyMonitor" ? `.${import.meta.env.VITE_ROUTE_URL}users/websites/${row.Username}` : "#"),
    children: (row, value) => {
      const linkClass = "ama-typography-body bold";
      if (row.Type === "MyMonitor") {
        const href = `.${import.meta.env.VITE_ROUTE_URL}users/websites/${row.Username}`;
        return (
          <a href={href} className={linkClass} id={`link_${row.id}_Username`}>
            {value}
          </a>
        );
      }
      return (
        <label htmlFor={'checkbox_' + row.id} className={linkClass}>
          {value}
        </label>
      );
    }
  },
  Type: { type: "Text", center: false, bold: false, decimalPlace: false },
  Websites: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  Last_Login: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  Register_Date: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  edit: { type: "Button",text:i18n.t('USERS_PAGE.LIST.table.edit_label'), onClick: (row)=>{navigate(`/dashboard/users/edit/${row.id}`)}, center: true, bold: false, decimalPlace: false },
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
   href: (row)=>`.${import.meta.env.VITE_ROUTE_URL}pages/${row.Username}/${row.Name}` },
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
    { type: "SortingText", nRow: 1, name: i18n.t('WEBSITES_PAGE.LIST.table.name_label'), property: "Url", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('PAGES_PAGE.LIST.table.score_label'), property: "Score", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('PAGES_PAGE.LIST.table.last_updated_label'), property: "Evaluation_Date", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('WEBSITES_PAGE.LIST.table.import'), property: "import", justifyCenter: true },
  ],
];

export const pagesUsersColumnsOptions = (navigate, handleImportPage, canImportPage)=>({
  id: { type: "Skip", center: false, bold: false, decimalPlace: false },
  ShowIn: { type: "Skip", center: false, bold: false, decimalPlace: false },
  Username: { type: "Skip", center: false, bold: false, decimalPlace: false },
  Name: { type: "Skip", center: false, bold: false, decimalPlace: false },
  Url: { type:  "Link" , center: true, bold: false, decimalPlace: false, href: (row)=>`/ams/dashboard/users/websites/pages/details/${row.id}/${row.Username}/${row.Name}/${encodeURIComponent(row.Url)}` },
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
