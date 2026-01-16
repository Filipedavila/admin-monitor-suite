import i18n from '../../i18n';


export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 1, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.short_name_label'),
      property: "shortName",
    },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.long_name_label'),
      property: "fullName",
    },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.creation_label'),
      property: "createdAt",
      justifyCenter: true,
    },
    {
      type: "SortingText",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.websites_label'),
      property: "websiteCount",
      justifyCenter: true,
    },
    {
      type: "Action",
      nRow: 1,
      name: i18n.t('ENTITIES_PAGE.LIST.table.edit_label'),
      property: "edit",
      justifyCenter: true,
    },
  ],
];

export const columnsOptions = {
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label:"Selecionar"},
  shortName: { type: "Text", center: false, bold: false, decimalPlace: false, isCheckboxLabel: true },
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


export const mainTableHeaders = [[
  { type: "Text", name: "Nome", property: "name" },
  { type: "Text", name: "Data da declaração", property: "declarationDate" },
  { type: "Text", name: "Data de revisão", property: "reviewDate" },
  { type: "Text", name: "Estado", property: "status" },
  { type: "Text", name: "Conformidade", property: "compliance" },
  { type: "Text", name: "Setor", property: "sector" },
  { type: "Text", name: "Nº de entidades", property: "numEntities" },
  { type: "Text", name: "Nº acessos", property: "numAcessos" },
  { type: "Text", name: "Ano civil/relatório", property: "anoCivil" },
]];

export const mainTableRows = [
  { name: "Entidade 1", declarationDate: "2024-01-01", reviewDate: "2025-01-01", status: "Ativa", compliance: "Total", sector: "Público", numEntities: 5, numAcessos: 100, anoCivil: "2024" },
];

export const mainColumnsOptions = {
    name: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },
    declarationDate: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },
    reviewDate: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },
    status: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },
    compliance: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },
    sector: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },
    numEntities: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },
    numAcessos: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },
    anoCivil: {
        type: "Text",
        center: false,
        bold: false,
        decimalPlace: false,
    },

};

export const Tab2Headers = [[
  { type: "Text", name: "Área", property: "area" },
  { type: "Text", name: "Nº de declarações", property: "numDeclaracoes" },
]];


export const Tab2ColumnsOptions = {
  area: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
  numDeclaracoes: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
};

export const Tab2DataRows = [
  { area: "Educação", numDeclaracoes: "5" },
  { area: "Saúde", numDeclaracoes: "3" },
  { area: "Justiça", numDeclaracoes: "2" },
];

export const estadoDeclaracoesHeaders = [[
  { type: "Text", name: "Estado", property: "estado" },
  { type: "Text", name: "Nº de declarações", property: "numDeclaracoes" },
]];

export const estadoDeclaracoesRows = [
  { estado: "Publicado", numDeclaracoes: 7 },
  { estado: "Rascunho", numDeclaracoes: 3 },
  { estado: "Arquivado", numDeclaracoes: 2 },
];

export const estadoDeclaracoesColumnsOptions = {
  estado: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
  numDeclaracoes: {
    type: "Number",
    center: false,
    bold: false,
    decimalPlace: false,
  },
};

export const conformidadeDeclaradaHeaders = [[
  { type: "Text", name: "Estado", property: "estado" },
  { type: "Text", name: "Nº de declarações", property: "numDeclaracoes" },
]];

export const conformidadeDeclaradaRows = [
  { estado: "Totalmente conforme", numDeclaracoes: 4 },
  { estado: "Parcialmente conforme", numDeclaracoes: 5 },
  { estado: "Não conforme", numDeclaracoes: 1 },
];

export const conformidadeDeclaradaColumnsOptions = {
  estado: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
  numDeclaracoes: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
};


export const estadoPorDiretorioColumnsOptions = {
  sede: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
  direcao: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
  posto: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
  outro: {
    type: "Text",
    center: false,
    bold: false,
    decimalPlace: false,
  },
};
export const estadoPorDiretorioHeaders = [[
  { type: "Text", name: "Sede", property: "sede" },
  { type: "Text", name: "Direção", property: "direcao" },
  { type: "Text", name: "Posto", property: "posto" },
  { type: "Text", name: "Outro", property: "outro" },
]];

export const estadoPorDiretorioRows = [
  { sede: "Sede 1", direcao: "Direção A", posto: "Posto X", outro: "Outro Y" },
  { sede: "Sede 2", direcao: "Direção B", posto: "Posto Y", outro: "Outro Z" },
  { sede: "Sede 3", direcao: "Direção C", posto: "Posto Z", outro: "Outro W" },
];

export const estadoPorNivelDiretorioColumnsOptions = {
  diretorio: { type: "Text", center: false, bold: false, decimalPlace: false },
  bronze: { type: "Text", center: false, bold: false, decimalPlace: false },
  prata: { type: "Text", center: false, bold: false, decimalPlace: false },
  ouro: { type: "Text", center: false, bold: false, decimalPlace: false },
};

export const estadoPorNivelDiretorioRows = [
  { diretorio: "Test 1", bronze: 1, prata: 2, ouro: 1 },
  { diretorio: "Test 2", bronze: 2, prata: 1, ouro: 0 },
  { diretorio: "Test 3", bronze: 3, prata: 2, ouro: 1 },
];

export const estadoPorNivelDiretorioHeaders = [[
  { type: "Text", name: "Nome do diretório", property: "diretorio" },
  { type: "Text", name: "Nº de sites do bronze", property: "bronze" },
  { type: "Text", name: "Nº de sites da prata", property: "prata" },
  { type: "Text", name: "Nº de sites de ouro", property: "ouro" },
]];

export const conformidadePorDiretorioColumnsOptions = {
  diretorio: { type: "Text", center: false, bold: false, decimalPlace: false },
  pleno: { type: "Text", center: false, bold: false, decimalPlace: false },
  parcial: { type: "Text", center: false, bold: false, decimalPlace: false },
  naoConforme: { type: "Text", center: false, bold: false, decimalPlace: false },
};

export const conformidadePorDiretorioRows = [
  { diretorio: "Test 1", pleno: 1, parcial: 2, naoConforme: 0 },
  { diretorio: "Test 2", pleno: 2, parcial: 1, naoConforme: 1 },
  { diretorio: "Test 3", pleno: 3, parcial: 0, naoConforme: 2 },
];

export const conformidadePorDiretorioHeaders = [[
  { type: "Text", name: "Nome do diretório", property: "diretorio" },
  { type: "Text", name: "Plenamente conforme", property: "pleno" },
  { type: "Text", name: "Parcialmente conforme", property: "parcial" },
  { type: "Text", name: "Não conforme", property: "naoConforme" },
]];


export const pesoConformidadeOPAWColumnsOptions = {
  diretorio: { type: "Text", center: false, bold: false, decimalPlace: false },
  parcial: { type: "Text", center: false, bold: false, decimalPlace: false },
  naoConforme: { type: "Text", center: false, bold: false, decimalPlace: false },
};

export const pesoConformidadeOPAWRows = [
  { diretorio: "Test 1", parcial: 1, naoConforme: 1 },
  { diretorio: "Test 2", parcial: 2, naoConforme: 1 },
  { diretorio: "Test 3", parcial: 3, naoConforme: 0 },
];

export const pesoConformidadeOPAWHeaders = [[
  { type: "Text", name: "Nome do diretório", property: "diretorio" },
  { type: "Text", name: "Parcialmente conforme", property: "parcial" },
  { type: "Text", name: "Não conforme", property: "naoConforme" },
]];

export const balancoAvaliacoesColumnsOptions = {
  tipo: { type: "Text", center: false, bold: false, decimalPlace: false },
  numAvaliacoes: { type: "Text", center: false, bold: false, decimalPlace: false },
};

export const balancoAvaliacoesRows = [
  { tipo: "Utilizador", numAvaliacoes: 1 },
  { tipo: "Manual", numAvaliacoes: 2 },
  { tipo: "Automática", numAvaliacoes: 3 },
];

export const balancoAvaliacoesHeaders = [[
  { type: "Text", name: "Tipo", property: "tipo" },
  { type: "Text", name: "Nº de avaliações", property: "numAvaliacoes" },
]];

