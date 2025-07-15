const apiUrl = import.meta.env.VITE_API_URL;

const theme = "light"

export const dataHeaders = [
  [
    { type: "Text", nRow: 1, name: "Intervalo", property: "range" },
    { type: "Text", nRow: 1, name: "Frequência (n.º de páginas)", property: "frequency", justifyCenter: true },
    { type: "Text", nRow: 1, name: "Frequência (n.º de páginas) (%)", property: "frequency_percent", justifyCenter: true },
    { type: "Text", nRow: 1, name: "Frequência acumulada", property: "cumulative", justifyCenter: true },
    { type: "Text", nRow: 1, name: "Frequência acumulada (%)", property: "cumulative_percent", justifyCenter: true },
  ],
];

export const columnsOptions = {
  range: { type: "Text", center: false, bold: false, decimalPlace: false, property: "range" },
  frequency: { type: "Number", center: true, bold: false, decimalPlace: false, property: "frequency" },
  frequency_percent: { type: "Text", center: true, bold: false, decimalPlace: false, property: "frequency_percent" },
  cumulative: { type: "Number", center: true, bold: false, decimalPlace: false, property: "cumulative" },
  cumulative_percent: { type: "Text", center: true, bold: false, decimalPlace: false, property: "cumulative_percent" },
};

const generateAccessibleId = (name, type) => {
  // Convert name to lowercase and replace spaces with hyphens
  const sanitizedName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Add type and timestamp for uniqueness
  return `${type.toLowerCase()}-${sanitizedName}-${Date.now()}`;
};

export const dataList = [
  {
    range: '[1 - 2[',
    frequency: 2,
    frequency_percent: '5%',
    cumulative: 2,
    cumulative_percent: '5%'
  },
  {
    range: '[2 - 3[',
    frequency: 5,
    frequency_percent: '12.5%',
    cumulative: 7,
    cumulative_percent: '17.5%'
  },
  {
    range: '[3 - 4[',
    frequency: 8,
    frequency_percent: '20%',
    cumulative: 15,
    cumulative_percent: '37.5%'
  },
  {
    range: '[4 - 5[',
    frequency: 10,
    frequency_percent: '25%',
    cumulative: 25,
    cumulative_percent: '62.5%'
  },
  {
    range: '[5 - 6[',
    frequency: 6,
    frequency_percent: '15%',
    cumulative: 31,
    cumulative_percent: '77.5%'
  },
  {
    range: '[6 - 7[',
    frequency: 4,
    frequency_percent: '10%',
    cumulative: 35,
    cumulative_percent: '87.5%'
  },
  {
    range: '[7 - 8[',
    frequency: 2,
    frequency_percent: '5%',
    cumulative: 37,
    cumulative_percent: '92.5%'
  },
  {
    range: '[8 - 9[',
    frequency: 2,
    frequency_percent: '5%',
    cumulative: 39,
    cumulative_percent: '97.5%'
  },
  {
    range: '[9 - 10[',
    frequency: 1,
    frequency_percent: '2.5%',
    cumulative: 40,
    cumulative_percent: '100%'
  }
];

export const headersBarLine = ['[1 - 2[', '[2 - 3[', '[3 - 4[', '[4 - 5[', '[5 - 6[', '[6 - 7[', '[7 - 8[', '[8 - 9[', '[9 - 10[']

export const barData = {
  labels: headersBarLine,
  datasets: [
   /* {
      type: 'line',
      label: "Percentagem(nº de páginas)",
      data: [1, 2, 3, 0, 0, 0, 0, 0, 10],
      backgroundColor: 'rgba(51, 51, 153, 1)',
      borderColor: 'rgba(51, 51, 153, 1)',
      borderWidth: 2,
      fill: false,
      tension: 0,
      pointBackgroundColor: 'red',
      pointBorderColor: 'red',
    },*/
    {
      type: 'bar',
      label: "Frequência (nº de páginas)",
      data: [1, 2, 3, 1, 0, 0, 0, 0, 10],
      backgroundColor: '#339', // All bars same color
      categoryPercentage: 1,
      barPercentage: 1,
      grouped: true, // For Chart.js 4.x, ensures no grouping/spacing
    },
   
  ],
  options: {
    responsive: false, // disables auto-resize
    maintainAspectRatio: false, // allows custom aspect ratio
  }
};

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
      categoryPercentage: 1.0, // Bars take full category width
      barPercentage: 1.0, // Bars take full available space
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: "Teste de label 1",
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
        text: "Teste de label 1",
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

