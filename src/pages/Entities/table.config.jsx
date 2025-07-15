import i18n from '../../i18n';
const apiUrl = import.meta.env.VITE_API_URL;

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 2, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    {
      type: "SortingText",
      nRow: 2,
      name: i18n.t('ENTITIES_PAGE.LIST.table.short_name_label'),
      property: "shortName",
    },
    {
      type: "SortingText",
      nRow: 2,
      name: i18n.t('ENTITIES_PAGE.LIST.table.long_name_label'),
      property: "fullName",
    },
    {
      type: "SortingText",
      nRow: 2,
      name: i18n.t('ENTITIES_PAGE.LIST.table.creation_label'),
      property: "createdAt",
      justifyCenter: true,
    },
    {
      type: "SortingText",
      nRow: 2,
      name: i18n.t('ENTITIES_PAGE.LIST.table.websites_label'),
      property: "websiteCount",
      justifyCenter: true,
    },
    {
      type: "Action",
      nRow: 2,
      name: i18n.t('ENTITIES_PAGE.LIST.table.edit_label'),
      property: "edit",
      justifyCenter: true,
    },
  ],
];

export const columnsOptions = {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label:"Selecionar"},
  shortName: { type: "Link", center: false, bold: false, decimalPlace: false, href: (row) => apiUrl + "dashboard/entities/view/" + row.shortName },
  fullName: { type: "Text", center: false, bold: false, decimalPlace: false },
  createdAt: { type: "Text", center: true, bold: false, decimalPlace: false },
  websiteCount: {
    type: "Text",
    center: true,
    bold: false,
    decimalPlace: false,
  },
  edit: { type: "Action", center: true, bold: false, decimalPlace: false },
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
    id: 1,
    shortName: "AMA",
    fullName: "Agência para a Modernização Administrativa",
    createdAt: "2023-01-15",
    websiteCount: 5,
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
