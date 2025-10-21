import i18n from '../../i18n';
// headers da tabela
const apiUrl = import.meta.env.VITE_API_URL + import.meta.env.VITE_ROUTE_URL;

const theme = "light"

export const directoriesHeaders = [
  [
    { type: "Checkbox", nRow: 2, name: i18n.t('MISC.select'), property: "id", label: i18n.t('MISC.select') },
    { type: "SortingText", nRow: 2, name: i18n.t('WEBSITES_PAGE.LIST.table.name_label'), property: "Name" },
    { type: "SortingText", nRow: 2, name: i18n.t('WEBSITES_PAGE.LIST.table.url_label'), property: "StartingUrl" },
    { type: "SortingText", nRow: 2, name: i18n.t('WEBSITES_PAGE.LIST.table.pages_label'), property: "Pages", justifyCenter: true },
    { type: "SortingText", nRow: 2, name: i18n.t('WEBSITES_PAGE.LIST.table.creation_label'), property: "Creation_Date", justifyCenter: true },
    { type: "SortingText", nRow: 2, name: i18n.t('WEBSITES_PAGE.LIST.table.stamp_label'), property: "Declaration" },
    { type: "SortingText", nRow: 2, name: i18n.t('WEBSITES_PAGE.LIST.table.edit_label'), property: "edit", justifyCenter: true },
  ],
];

// opções de renderização de colunas
export const columnsOptions = (navigate) => ({
  id: { type: "Checkbox", center: true, bold: false, decimalPlace: false, label:"Selecionar"},
  Name: { type: "Link", center: false, bold: false, decimalPlace: false, href: (row)=>{
    return `${apiUrl}dashboard/websites/view/${row.id}/${row.Name}`
  } },
  StartingUrl: { type: "Text", center: false, bold: false, decimalPlace: false },
  Pages: { type: "Text", center: true, bold: false, decimalPlace: false }, // alinhado ao centro
  Creation_Date: { type: "Text", center: true, bold: false, decimalPlace: false }, // alinhado ao centro
  Declaration: { type: "Text", center: false, bold: false, decimalPlace: false },
  edit: { type: "Button", text: i18n.t('WEBSITES_PAGE.LIST.table.edit_label'), onClick: (row) => { 
    navigate(`${import.meta.env.VITE_ROUTE_URL}dashboard/websites/edit/${row.id}`)
  }, center: true, bold: false, decimalPlace: false },
});

// ícones possíveis (não usados diretamente aqui, mas podem ser úteis no futuro)
export const nameOfIcons = [
  "Selo Bronze",
  "Selo Prata",
  "Selo Ouro",
  "Declaração não conforme",
  "Declaração parcialmente conforme",
  "Declaração plenamente conforme",
];

// textos de paginação
export const paginationButtonsTexts = [
  i18n.t('FIRST_PAGE_LABEL'),
  i18n.t('PREVIOUS_PAGE_LABEL'),
  i18n.t('NEXT_PAGE_LABEL'),
  i18n.t('LAST_PAGE_LABEL'),
];

export const nItemsPerPageText = [i18n.t('ITEMS_PER_PAGE_LABEL')];

export const itemsPaginationText = [i18n.t('RANGE_PAGE_LABEL_1'), i18n.t('RANGE_PAGE_LABEL_2')];

// dados da tabela (apenas uma linha como exemplo)
export const dataRows = [
  {
    id: 1,
    Name: "Agência para a Modernização",
    StartingUrl: "https://exemplo.pt",
    Pages: "18",
    Creation_Date: "05/06/2025",
    Declaration: "Selo Ouro",
    edit: "Editar",
  },
];

// opções adicionais se aplicável
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
export const optionsHorizontalBar = {
  indexAxis: 'y', // This makes the bar chart horizontal
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white', // Color of the legend text
      }
    },
  },
  elements: {
    bar: {
      borderWidth: 0, // Remove border between bars
    }
  },
  datasets: {
    bar: {
      categoryPercentage: 1.0,
      barPercentage: 1.0,
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Nº de Ocorrências",
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white', // Color of Title on X axis
        font: {
          size: 14
        }
      },  
      ticks: {
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white' // Color of Text on X axis
      },
      grid: {
        color: theme === "light" ? 'rgba(0,0,0, 0.1)' : 'rgba(255, 255, 255, 0.2)' // Color of Dividers vertically
      }
    },
    y: {
      title: {
        display: true,
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white', // Color of Title on Y axis
        font: {
          size: 14
        }
      },
      ticks: {
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white', // Color of Text on Y axis
        
      },
      grid: {
        color: theme === "light" ? 'rgba(0,0,0, 0.1)' : 'rgba(255, 255, 255, 0.2)' // Color of Dividers horizontaly
      }
    }
  }
};

export const barOptions = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white',
      }
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "",
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white',
        font: {
          size: 14
        }
      },
      ticks: {
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white'
      },
      grid: {
        color: theme === "light" ? 'rgba(0,0,0, 0.1)' : 'rgba(255, 255, 255, 0.2)'
      }
    },
    y: {
      title: {
        display: true,
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white',
        font: {
          size: 14
        }
      },
      ticks: {
        color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white',
      },
      grid: {
        color: theme === "light" ? 'rgba(0,0,0, 0.1)' : 'rgba(255, 255, 255, 0.2)'
      }
    }
  }
};

export const optionsHorizontalBarDark = {
  indexAxis: 'y', // This makes the bar chart horizontal
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'white', // Color of the legend text
      }
    },
  },
  elements: {
    bar: {
      borderWidth: 0, // Remove border between bars
    }
  },
  datasets: {
    bar: {
      categoryPercentage: 1.0, // Bars take full category width
      barPercentage: 1.0, // Bars take full available space
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "",
        color:  'white', // Color of Title on X axis
        font: {
          size: 14
        }
      },
      ticks: {
        color: 'white' // Color of Text on X axis
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.2)' // Color of Dividers vertically
      }
    },
    y: {
      title: {
        display: true,
        color: 'white', // Color of Title on Y axis
        font: {
          size: 14
        }
      },
      ticks: {
        color: 'white', // Color of Text on Y axis
        
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.2)' // Color of Dividers horizontaly
      }
    }
  }
};

export const barOptionsDark = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: 'white',
      }
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "",
        color: 'white',
        font: {
          size: 14
        }
      },
      ticks: {
        color: 'white'
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    },
    y: {
      title: {
        display: true,
        color: 'white',
        font: {
          size: 14
        }
      },
      ticks: {
        color: 'white',
      },
      grid: {
        color: 'rgba(255, 255, 255, 0.2)'
      }
    }
  }
};

export const barData = {
  labels: ['0-1', '1-2', '2-3', '3-4', '4-5', '5-6', '6-7', '7-8', '8-9', '9-10'],
  datasets: [
    {
      label: 'Número de páginas',
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      backgroundColor: 'rgba(75, 192, 192, 0.6)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1
    }
  ]
};

export const horizontalData = {
  labels: [
    "Verifiquei que <mark>todos</mark> os elementos <code>&lt;li&gt;</code> estão contidos dentro de uma lista.",
    "Verifiquei que <mark>todas</mark> as ligações têm nome acessível.",
    "Constatei que nesta página <mark>não há</marks> atributos <code>id</code> repetidos.",
    "Verifiquei que <mark>todas</mark> as listas só contêm itens de lista.",
    "Constatei que todos os elementos com um papel semântico que confere aos seus descendentes um papel decorativo, não têm descendentes focáveis",
    "Verifiquei que <mark>todos</mark> os atributos aria-* estão de acordo com a especificação ARIA.",
    "Verifiquei que <mark>todos</mark> os estados e todas as propriedades ARIA têm um tipo de valor válido.",
    "Verifiquei que <mark>todos</mark> os estados e todas as propriedades ARIA são permitidos.",
    "Não encontrei elementos marcados como decorativos que tenham sido expostos a Tecnologias de Apoio",
    "Verifiquei que <mark>todos</mark> os atributos <code>role</code> têm um valor válido"
  ],
  datasets: [
    {
      type: 'bar',
      label: "Nº de Páginas",
      data: [
        42,
        39,
        22,
        42,
        41,
        42,
        42,
        41,
        37,
        3
      ],
      backgroundColor: "green",
      borderWidth: 0,
    }
  ]
};