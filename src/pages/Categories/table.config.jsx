export const directoriesHeaders = [
  [
    {type: "Checkbox", nRow: 2, name: "Selecionar", property: "id", justifyCenter: true},
    {type: "SortingText", nRow: 2, name: "Nome", property: "name"},
    {type: "SortingText", nRow: 2, name: "Nº sítios Web", property: "numberSites", justifyCenter: true},
  ]
]

export const columnsOptions = {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label: "Selecionar" },
  name: { type: "Link", center: false, bold: false, decimalPlace: false, href: (row) => {
    return `http://localhost:5173/dashboard/categories/view/${row.name}`
  } },
  numberSites: { type: "Text", center: false, bold: false, decimalPlace: false },
 }

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

export const nItemsPerPageText=[
  "Ver ",
  " itens por página"
]

export const itemsPaginationText = [
  " de ",
  " itens"
]

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
    name: "Portal Mais Transparência",
    numberSites: "12",
  },
  {
    id: generateAccessibleId("Instituto da Segurança Social"),
    name: "Instituto da Segurança Social, I.P. - Portal Seg Social com o <title>",
    numberSites: "24",
  },
  {
    id: generateAccessibleId("Portal do SNS 24"),
    name: "Portal do SNS 24",
    numberSites: "23",
  },
  {
    id: generateAccessibleId("Comissão Nacional de Eleições"),
    name: "Comissão Nacional de Eleições",
    numberSites: "64",
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
