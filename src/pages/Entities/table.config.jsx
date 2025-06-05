

export const directoriesHeaders = [
  [
    {type: "Checkbox", nRow: 2, name: "rank ", property: "title"},
    {type: "SortingText", nRow: 2, name: "Email ", property: "email"},
    {type: "SortingText", nRow: 2, name: "Nome do usuário", property: "username", justifyCenter: true},
    {type: "SortingText", nRow: 2, name: "Tipo", property: "type", justifyCenter: true},
  ]
]

export const columnsOptions = {
  id: { type: "Skip", center: false, bold: false, decimalPlace: false },
  id: { type: "Skip", center: false, bold: false, decimalPlace: false },
  email: { type: "Text", center: false, bold: false, decimalPlace: false },
  username: { type: "Text", center: false, bold: false, decimalPlace: false },
  type: { type: "Text", center: true, bold: false, decimalPlace: true },
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


export const dataRows = [
  {
    "id": 22,
    "email": "Portal Mais Transparência <code>teste</code>",
    "username": "Agência para a Modernização Administrativa",
    "type": "MyMonitor",

  },
  {
    "id": 23,
    "email": "Instituto da Segurança Social, I.P. - Portal Seg Social com o <title>",
    "username": "Instituto da Segurança Social, I.P.",
    "type": "MyMonitor",
  },
  {
    "id": 31,
    "email": "Portal do SNS 24",
    "username": "Serviços Partilhados do Ministério da Saúde, E.P.E.",
    "type": "AcessMonitor",
  },
  {
    "id": 25,
    "email": "Comissão Nacional de Eleições",
    "username": "Comissão Nacional de Eleições",
    "type": "AcessMonitor",
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
