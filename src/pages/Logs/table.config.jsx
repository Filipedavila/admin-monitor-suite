// Table headers for SortingTable
import i18n from "../../i18n";

export const directoriesHeaders = [
  [
    { type: "SortingText", nRow: 1, name:"Log", property: "log", label: "Log"},

  ]
];

// Column rendering options
export const columnsOptions = {
  log: { type: "Link", center: true, bold: false, decimalPlace: false, href: (row)=>{
    return `${import.meta.env.VITE_API_URL}api/log/action-log/${row.log}`
  } },
  };

// Mock data
export const dataRows = [
  {
    log: "monitor-server-2025-04-22.log",
  },
  {
    log: "monitor-server-2025-04-24.log",
  },
];

// Icon alt texts and pagination (optional, can be empty or copied from other modules)
export const nameOfIcons = [];
export const paginationButtonsTexts = []; 