import i18n from "../../i18n";
const apiUrl = import.meta.env.VITE_API_URL + import.meta.env.VITE_ROUTE_URL;

export const directoriesHeaders = [
  [
    {
      type: "Checkbox",
      nRow: 1,
      center: true,
      name: i18n.t("MISC.rank"),
      property: "id",
    },
    {
      type: "SortingText",
      bigWidth: "50%",
      nRow: 1,
      center: true,
      name: i18n.t("DIRECTORIES_PAGE.LIST.table.name_label"),
      property: "Name",
      justifyCenter: false,
    },
    {
      type: "SortingText",
      nRow: 1,
      center: true,
      name: "Observatório",
      property: "Show_in_Observatory",
      justifyCenter: true,
    },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t("USERS_PAGE.LIST.table.edit_label"),
      property: "edit",
      justifyCenter: true,
    },
  ],
];

export const columnsOptions = (navigate) => ({
  id: { type: "Checkbox", center: false, bold: false, decimalPlace: false },
  Name: {
    type: "Link",
    center: false,
    bold: false,
    decimalPlace: false,
    isCheckboxLabel: true,
    href: (row) => {
      return `${apiUrl}dashboard/directories/view/${row.Name}`;
    },
  },
  Show_in_Observatory: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: true,
  },
  edit: {
    type: "Button",
    text: i18n.t("USERS_PAGE.LIST.table.edit_label"),
    onClick: (row) => {
      navigate(
        `${import.meta.env.VITE_ROUTE_URL}dashboard/directories/edit/${row.id}`
      );
    },
    center: true,
    bold: false,
    decimalPlace: false,
  },
});

export const nameOfIcons = [
  "Selo Bronze",
  "Selo Prata",
  "Selo Ouro",
  "Declaração não conforme",
  "Declaração parcialmente conforme",
  "Declaração plenamente conforme",
];

export const paginationButtonsTexts = [
  i18n.t("FIRST_PAGE_LABEL"),
  i18n.t("PREVIOUS_PAGE_LABEL"),
  i18n.t("NEXT_PAGE_LABEL"),
  i18n.t("LAST_PAGE_LABEL"),
];

export const nItemsPerPageText = [i18n.t("ITEMS_PER_PAGE_LABEL")];

export const itemsPaginationText = [
  i18n.t("RANGE_PAGE_LABEL_1"),
  i18n.t("RANGE_PAGE_LABEL_2"),
];

export const dataRows = [
  {
    DirectoryId: 22,
    Name: "Portal Mais Transparência",
    Show_in_Observatory: "MyMonitor",
    edit: i18n.t("USERS_PAGE.LIST.table.edit_label"),
  },
  {
    DirectoryId: 23,
    Name: "Instituto da Segurança Social, I.P. - Portal Seg Social com o <title>",
    Show_in_Observatory: "MyMonitor",
    edit: i18n.t("USERS_PAGE.LIST.table.edit_label"),
  },
  {
    DirectoryId: 31,
    Name: "Portal do SNS 24",
    Show_in_Observatory: "AcessMonitor",
    edit: i18n.t("USERS_PAGE.LIST.table.edit_label"),
  },
  {
    DirectoryId: 25,
    Name: "Comissão Nacional de Eleições",
    Show_in_Observatory: "AcessMonitor",
    edit: i18n.t("USERS_PAGE.LIST.table.edit_label"),
  },
];

export const optionsNormalTable = [
  {
    id: "1",
    title:
      "I found 1 image on the page without the alternative text equivalent.",
    lvl: "AA",
    ele: "test",
    tdClassName: "warning-cell",
  },
];

export const detailsTableHeaders = [
  [
    {
      type: "Text",
      nRow: 1,
      bigWidth: "50%",
      name: i18n.t("WEBSITES_PAGE.table_best_practices.practice_label"),
      property: "practice",
    },
    {
      type: "Text",
      nRow: 1,
      name: i18n.t("WEBSITES_PAGE.table_best_practices.n_pages_label"),
      justifyCenter: true,
      property: "pages",
    },
    {
      type: "Text",
      nRow: 1,
      name: i18n.t("WEBSITES_PAGE.table_best_practices.n_errors_label"),
      justifyCenter: true,
      property: "occurrences",
    },
    {
      type: "Text",
      nRow: 1,
      name: i18n.t("WEBSITES_PAGE.table_best_practices.lvl_label"),
      justifyCenter: true,
      property: "level",
    },
  ],
];

export const columnsOptionsDetails = {
  practice: {
    type: "DangerousHTML",
    center: false,
    bold: false,
    decimalPlace: false,
    property: "practice",
  },
  pages: {
    type: "Number",
    center: true,
    bold: false,
    decimalPlace: false,
    property: "pages",
  },
  occurrences: {
    type: "Number",
    center: true,
    bold: false,
    decimalPlace: false,
    property: "occurrences",
  },
  level: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
    ariaLabel: true,
    property: "level",
  },
};

export const ariaLabels = {
  A: i18n.t("WEBSITES_PAGE.ariaLabels.A"),
  AA: i18n.t("WEBSITES_PAGE.ariaLabels.AA"),
  AAA: i18n.t("WEBSITES_PAGE.ariaLabels.AAA"),
};

export const detailsTable = [
  {
    practice: "Verifiquei que todas as ligações têm nome acessível.",
    pages: 42,
    occurrences: 5471,
    level: "AA",
  },
  {
    practice: "Encontrei um elemento com a semântica de banner.",
    pages: 42,
    occurrences: 1402,
    level: "AA",
  },
];
