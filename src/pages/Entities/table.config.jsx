import i18n from '../../i18n';
const apiUrl = import.meta.env.VITE_API_URL + import.meta.env.VITE_ROUTE_URL;

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 1, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.short_name_label'),
      property: "Short_Name",
    },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.long_name_label'),
      property: "Long_Name",
    },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.creation_label'),
      property: "Creation_at",
      justifyCenter: true,
    },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.websites_label'),
      property: "Websites",
      justifyCenter: true,
    },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.edit_label'),
      property: "edit",
      justifyCenter: true,
    },
  ],
];

export const columnsOptions = (navigate)=>({
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label:"Selecionar"},
  Short_Name: { type: "Link", isCheckboxLabel: true, center: false, bold: false, decimalPlace: false, href: (row) => apiUrl + "dashboard/entities/view/" + row.Long_Name },
  Long_Name: { type: "Text", center: false, bold: false, decimalPlace: false },
  Creation_at: { type: "Text", center: true, bold: false, decimalPlace: false },
  Websites: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  edit: { type: "Button",text:i18n.t('USERS_PAGE.LIST.table.edit_label'), onClick: (row)=>{ 
    navigate(`${import.meta.env.VITE_ROUTE_URL}dashboard/entities/edit/${row.id}`)
  }, center: true, bold: false, decimalPlace: false },
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
  i18n.t('FIRST_PAGE_LABEL'),
  i18n.t('PREVIOUS_PAGE_LABEL'),
  i18n.t('NEXT_PAGE_LABEL'),
  i18n.t('LAST_PAGE_LABEL'),
];

export const nItemsPerPageText = [i18n.t('ITEMS_PER_PAGE_LABEL')];

export const itemsPaginationText = [i18n.t('RANGE_PAGE_LABEL_1'), i18n.t('RANGE_PAGE_LABEL_2')];

export const dataRows = [
  {
    id: 1,
    Short_Name: "AMA",
    Long_Name: "Agência para a Modernização Administrativa",
    Creation_at: "2023-01-15",
    Websites: 5,
    edit: "Editar",
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
