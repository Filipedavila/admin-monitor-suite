export const dataHeaders = [
  [
    { type: "Text", nRow: 1, bigWidth: "40%", name: "Práticas ", property: "name", },
    { type: "SortingText", nRow: 1, name: "Práticas por páginas", property: "praticesPerPage" },
    { type: "SortingText", nRow: 1, name: "Páginas", property: "pages" },
    { type: "SortingText", nRow: 1, name: "Ocorrência", property: "occurences" },
    { type: "SortingText", nRow: 1, name: "Nível", property: "level" },
  ]
]

export const columnsOptions = {
  name: {
    type: "DangerousHTML",
    center: false,
    bold: false,
    decimalPlace: false,

  },
  praticesPerPage: {
    type: "Text",   
    bold: false,
    decimalPlace: false,
    center: true
  },
  pages: {
    type: "Text",    
    bold: false,
    decimalPlace: false,
    center: true
  },
  occurences: {
    type: "Text",   
    bold: false,
    decimalPlace: false,
    center: true
  },
  level: {
    type: "Text",
    bold: false,
    decimalPlace: false,
    center: true
  }
};

export const nameOfIcons = [
  "Selo Bronze",
  "Selo Prata",
  "Selo Ouro",
  "Declaração não conforme",
  "Declaração parcialmente conforme",
  "Declaração plenamente conforme"
]

export const paginationButtonsTexts = [
  "Primeira página",
  "Página anterior",
  "Página seguinte",
  "Última página"
]

export const nItemsPerPageText = [
  "Ver ",
  " itens por página"
]

export const itemsPaginationText = [
  " de ",
  " itens"
]


export const dataRows = [
  {
    "name": "Practice A",
    "praticesPerPage": "5",
    "pages": "10",
    "occurences": "50",
    "level": "A"
  },
  {
    "name": "Practice B",
    "praticesPerPage": "3",
    "pages": "15",
    "occurences": "45",
    "level": "AAA"
  },
  {
    "name": "Practice C",
    "praticesPerPage": "7",
    "pages": "8",
    "occurences": "56",
    "level": "AA"
  },
  {
    "name": "Practice D",
    "praticesPerPage": "4",
    "pages": "12",
    "occurences": "48",
    "level": "A"
  },
  {
    "name": "Practice E",
    "praticesPerPage": "6",
    "pages": 9,
    "occurences": 60,
    "level": "AAAA"
  }
]
