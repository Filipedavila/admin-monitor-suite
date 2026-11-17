import i18n from '../../i18n';
import { Link } from "react-router-dom";

export const teamsHeaders = [
  [
    { type: "Checkbox", nRow: 1, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 1, name: "Equipa", property: "TeamName" },
    { type: "SortingText", nRow: 1, name: "Utilizadores", property: "Utilizadores", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: "Sítios Web", property: "SitiosWeb", justifyCenter: true },
    { type: "SortingText", nRow: 1, name: "Editar", property: "edit", justifyCenter: true },
  ],
];

export const columnsOptions = (navigate) => ({
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false },
  TeamName: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
    isCheckboxLabel: true,
    children: (row, value) => (
      <label htmlFor={'checkbox_' + row.id} className="ama-typography-body bold">
        {value}
      </label>
    ),
  },
  Utilizadores: {
    type: "Link",
    center: true,
    bold: false,
    decimalPlace: false,
    href: (row) => `/dashboard/teams/${row.id}/users`,
    children: (row, value) => (
      <Link
        to={`/dashboard/teams/${row.id}/users`}
        aria-label={`Ver e adicionar utilizadores da equipa ${row.TeamName}`}
        className="d-inline-flex align-items-center gap-1"
      >
        {value}
        <i className="icon-AMA-Externo-Line" aria-hidden="true"></i>
      </Link>
    ),
  },
  SitiosWeb: {
    type: "Link",
    center: true,
    bold: false,
    decimalPlace: false,
    href: (row) => `/dashboard/teams/${row.id}/websites`,
    children: (row, value) => (
      <Link
        to={`/dashboard/teams/${row.id}/websites`}
        aria-label={`Ver e adicionar sítios web da equipa ${row.TeamName}`}
        className="d-inline-flex align-items-center gap-1"
      >
        {value}
        <i className="icon-AMA-Externo-Line" aria-hidden="true"></i>
      </Link>
    ),
  },
  edit: {
    type: "Button",
    text: "Editar",
    onClick: (row) => { navigate(`/dashboard/teams/edit/${row.id}`); },
    center: true,
    bold: false,
    decimalPlace: false,
  },
});

export const nameOfIcons = [];

export const paginationButtonsTexts = [
  i18n.t('FIRST_PAGE_LABEL'),
  i18n.t('PREVIOUS_PAGE_LABEL'),
  i18n.t('NEXT_PAGE_LABEL'),
  i18n.t('LAST_PAGE_LABEL'),
];

// Table column property -> backend sort field (sorts[field]=ASC|DESC)
export const sortFields = { TeamName: "teamName" };
