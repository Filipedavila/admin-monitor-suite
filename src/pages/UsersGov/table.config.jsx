import i18n from '../../i18n';
import { useNavigate } from 'react-router-dom';

export const dataHeaders = [
  [
    { type: "Checkbox", nRow: 1, name: i18n.t('MISC.select'), property: "id", justifyCenter: true, label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 1, name: i18n.t('GOV_USERS_PAGE.LIST.table.username_label'), property: "name", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('GOV_USERS_PAGE.LIST.table.citizen_number_label'), property: "ccNumber", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('USERS_PAGE.LIST.table.register_label'), property: "registerDate", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('GOV_USERS_PAGE.LIST.table.last_login_label'), property: "lastLogin", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: i18n.t('GOV_USERS_PAGE.LIST.table.edit_label'), property: "edit", justifyCenter: true },
  ],
];


export const dataRows = [
  {
    id: 1,
    name: "Joana Costa",
    ccNumber: "3435566",
    registerDate: "2023-11-01",
    lastLogin: "2024-10-25",
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
