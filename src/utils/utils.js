import tests from './tests'
import { clone, orderBy } from "lodash";
import { saveAs } from "file-saver";

import { api } from '../config/api'
import tests_colors from './tests_colors';
import scs from './scs';
const pathUrl = "/dashboard/"
function getTopTenErrors(errors) {
  const errorsList = [];
  console.log("EROR:", errors)
  for (const key in errors || {}) {
    if (errors[key]) {
      errorsList.push({
        key,
        n_elems: errors[key].n_elems,
        nOccurrences: errors[key].nOccurrences,
        n_pages: errors[key].n_pages,
        test: tests[key].test
      });
    }
  }

  return errorsList.sort((a, b) => a.n_elems - b.n_elems).slice(0, 10);
}
export function removeCertainPages(parsedData, name, newPages) {
  localStorage.removeItem('websiteListForWebsitePage')
  const obj = parsedData.find(item => item.name === name);

  if (obj) {
    obj.pages = newPages.map(page => {
      let newPage
      if (page.hasOwnProperty('PageId')) {
        newPage = { id: page.PageId, ...page }
        delete newPage.PageId;
      }
      return newPage;
    });
    localStorage.setItem('websiteListForWebsitePage', JSON.stringify(parsedData))
  }

  return parsedData;
}
function getTopTenBestPractices(success) {
  const practices = [];
  for (const key in success || {}) {
    practices.push({
      key,
      nOccurrences: success[key].nOccurrences,
      n_pages: success[key].n_pages,
      test: tests[key].test
    });
  }

  return orderBy(
    practices,
    ["nOccurrences", "n_pages"],
    ["desc", "desc"]
  ).slice(0, 10);
}

function getWebsiteSuccessDetailsTable(success, pages) {
  const practices = [];
  for (const key in success || {}) {
    if (success[key]) {
      practices.push({
        key,
        test: tests[key].test,
        nOccurrences: success[key].nOccurrences,
        n_pages: success[key].n_pages,
        lvl: tests[key].level.toUpperCase(),
        quartiles: calculateQuartiles(getPassedOccurrencesByPage(key, pages)),
      });
    }
  }

  const practicesData = orderBy(
    practices,
    ["n_pages", "nOccurrences"],
    ["desc", "desc"]
  );
  const practicesKeys = Object.keys(practicesData);

  return { practicesKeys, practicesData };
}

function getWebsiteErrorsDetailsTable(errors, pages) {
  const practices = [];
  for (const key in errors || {}) {
    if (errors[key]) {
      practices.push({
        key,
        test: tests[key].test,
        nOccurrences: errors[key].nOccurrences,
        n_pages: errors[key].n_pages,
        lvl: tests[key].level.toUpperCase(),
        quartiles: calculateQuartiles(getErrorOccurrencesByPage(key, pages)),
      });
    }
  }

  const practicesData = orderBy(
    practices,
    ["n_pages", "nOccurrences"],
    ["desc", "desc"]
  );
  const practicesKeys = Object.keys(practicesData);

  return { practicesKeys, practicesData };
}

function getPassedOccurrencesByPage(test, pages) {
  const occurrences = [];
  for (const page of pages || []) {
    const tot = safeBase64ToJson(page.Tot, "Tot");
    const practice = tot.elems[tests[test]["test"]];
    if (
      tot.results[test] &&
      tests[test]["result"] === "passed"
    ) {
      if (!practice) {
        occurrences.push(1);
      } else {
        occurrences.push(practice);
      }
    }
  }
  return occurrences;
}

function getErrorOccurrencesByPage(test, pages) {
  const occurrences = [];

  for (const p of pages) {
    const tot = safeBase64ToJson(p.Tot, "Tot");
    const error = tot["elems"][tests[test]["test"]];
    if (error && tests[test]["result"] === "failed") {
      if (error === "langNo" || error === "titleNo") {
        occurrences.push(1);
      } else {
        occurrences.push(error);
      }
    }
  }
  return occurrences;
}
export function pagesListTable(pages, moment) {
  let pagesTable = []
  pages.map((page) => {
    const pageObject = {
      ...page,
      Evaluation_Date: moment(page.Evaluation_Date).format("LL"),
    }
    pagesTable.push(pageObject)
  })

  return pagesTable;
}
function calculateQuartiles(data) {
  const values = data
    .filter((e) => e !== undefined)
    .sort((a, b) => a - b);

  let q1;
  let q2;
  let q3;
  let q4;

  q1 = values[Math.round(0.25 * (values.length + 1)) - 1];

  if (values.length % 2 === 0) {
    q2 = (values[values.length / 2 - 1] + values[values.length / 2]) / 2;
  } else {
    q2 = values[(values.length + 1) / 2];
  }

  q3 = values[Math.round(0.75 * (values.length + 1)) - 1];
  q4 = values[values.length - 1];

  const tmp = {
    q1: [],
    q2: [],
    q3: [],
    q4: [],
  };

  let q;
  for (const v of values || []) {
    if (v <= q1) {
      q = "q1";
    } else {
      if (v <= q2) {
        q = "q2";
      } else {
        if (v <= q3) {
          q = "q3";
        } else {
          q = "q4";
        }
      }
    }

    tmp[q].push(v);
  }

  const final = [];

  for (const k in tmp) {
    if (k) {
      const v = tmp[k];
      const sum = v.length;
      if (sum > 0) {
        const test = {
          tot: sum,
          por: Math.round((sum * 100) / values.length),
          int: {
            lower: v[0],
            upper: v[sum - 1],
          },
        };

        final.push(clone(test));
      }
    }
  }

  return final;
}

function safeBase64ToJson(base64, label = "unknown") {
  try {
    if (typeof base64 !== "string") return {};

    const cleaned = base64.replace(/[^A-Za-z0-9+/=]/g, '');

    // Check if it's long enough to be valid base64
    if (cleaned.length < 10) return {};

    const binary = atob(cleaned);
    const utf8 = new TextDecoder("utf-8").decode(
      Uint8Array.from(binary, c => c.charCodeAt(0))
    );

    return JSON.parse(utf8);
  } catch (e) {
    console.warn(`❌ Failed to decode and parse ${label}:`, base64.slice(0, 50), e.message);
    return {};
  }
}

// Simplified function to get basic practice data
export function getSimplifiedPracticesData(pages) {
  let errors = {};
  let success = {};
  try {
    pages.forEach((page) => {
      const totAfterTransformation = safeBase64ToJson(page.Tot, "Tot");
      const errorAfterTransformation = safeBase64ToJson(page.Errors, "Errors");

      // Process each test result
      for (const key in totAfterTransformation.results || {}) {
        if (tests[key] === undefined) {
          continue;
        }

        const test = tests[key]["test"];
        const level = tests[key]["level"];
        const result = tests[key]["result"];
        const scs = tests[key]["scs"];
        // Get occurrences count
        const occurrences = errorAfterTransformation[test] === undefined || errorAfterTransformation[test] < 1
          ? 1
          : errorAfterTransformation[test];

        if (result === "failed") {
          if (errors[key]) {
            errors[key].occurrences += occurrences;
            errors[key].pages++;
          } else {
            errors[key] = {
              practice: test,
              pages: 1,
              occurrences: occurrences,
              level: level.toUpperCase(),
              scs: scs
            };
          }
        } else if (result === "passed") {
          if (success[key]) {
            success[key].occurrences += occurrences;
            success[key].pages++;
          } else {
            success[key] = {
              practice: test,
              pages: 1,
              occurrences: occurrences,
              level: level.toUpperCase(),
              scs: scs
            };
          }
        }
      }
    });

    // Convert objects to arrays and sort by occurrences (descending)
    const errorsList = Object.values(errors).sort((a, b) => b.occurrences - a.occurrences);
    const successList = Object.values(success).sort((a, b) => b.occurrences - a.occurrences);

    return {
      errors: errorsList,
      success: successList
    };

  } catch (e) {
    console.error("Error processing practices data:", e);
    return {
      errors: [],
      success: []
    };
  }
}

export function getData(website, pages, websiteList, websiteListForWebsitePage, moment) {
  let websiteScore = 0;
  let conformidadeA = 0;    //Não pode ter erros do tipo A
  let conformidadeAA = 0;   //Não pode ter erros do tipo A, AA
  let conformidadeAAA = 0;  //Não pode ter erros do tipo A, AA, AAA
  let pageWithErrors = 0;
  let accessibilityPlot = [];
  let scoreDistributionFrequency = [0, 0, 0, 0, 0, 0, 0, 0, 0]
  let errors = {}
  let success = {}
  let recentPage
  let oldestPage
  let pagesTable = []
  try {
    pages.map((page) => {

      const totAfterTransformation = safeBase64ToJson(page.Tot, "Tot");
      const errorAfterTransformation = safeBase64ToJson(page.Errors, "Errors");

      const pageScore = parseFloat(page.Score ?? 0) || 0;
      // Website Score
      websiteScore += pageScore

      // Conformed Pages
      if (page.A > 0) {
        pageWithErrors++;
      } else if (page.AA > 0) {
        conformidadeA++;
      } else if (page.AAA > 0) {
        conformidadeAA++;
      } else {
        conformidadeAAA++;
      }

      // Accesssibility Plot - Radar Data
      accessibilityPlot.push(pageScore)

      // BarLine Data - Frequência de score por páginas
      const floor = Math.floor(pageScore);
      scoreDistributionFrequency[floor >= 2 ? (floor === 10 ? floor - 2 : floor - 1) : 0]++;

      // Errors
      const pageErrors = errorAfterTransformation
      for (const key in totAfterTransformation.results || {}) {
        if (tests[key] === undefined) {
          continue;
        }

        const test = tests[key]["test"];
        const elem = tests[key]["elem"];
        const occurrences =
          pageErrors[test] === undefined || pageErrors[test] < 1
            ? 1
            : pageErrors[test];
        const result = tests[key]["result"];
        if (result === "failed") {
          if (Object.keys(errors).includes(key)) {
            errors[key]["nOccurrences"] += occurrences;
            errors[key]["n_pages"]++;
          } else {
            errors[key] = {
              n_pages: 1,
              nOccurrences: occurrences,
              elem,
              test,
              result,
            };
          }
        } else if (result === "passed") {
          if (Object.keys(success).includes(key)) {
            success[key]["nOccurrences"] += occurrences;
            success[key]["n_pages"]++;
          } else {
            success[key] = {
              n_pages: 1,
              nOccurrences: occurrences,
              elem,
              test,
              result,
            };
          }
        }
      }

      //Evaluation dates
      if (!recentPage) {
        recentPage = new Date(page.Evaluation_Date);
      }

      if (!oldestPage) {
        oldestPage = new Date(page.Evaluation_Date);
      }

      if (new Date(page.Evaluation_Date) > recentPage) {
        recentPage = new Date(page.Evaluation_Date);
      } else if (new Date(page.Evaluation_Date) < oldestPage) {
        oldestPage = new Date(page.Evaluation_Date);
      }


      const pageObject = {
        id: page.PageId,
        Uri: page.Uri,
        Show_In: page.Show_In,
        Creation_Date: page.Creation_Date,
        Score: typeof pageScore !== "number" ? 0 : pageScore,
        Evaluation_Date: page.Evaluation_Date,
        A: page.A,
        AA: page.AA,
        AAA: page.AAA,
        Tot: page.Tot,
        Errors: page.Errors,
      }
      delete pageObject.PageId;
      pagesTable.push(pageObject)
    })

    const websiteForList = {
      id: website.WebsiteId,
      rank: 0,
      name: website.Name,
      declaration: website.Declaration,
      stamp: website.Stamp,
      score: websiteScore / pages.length,
      nPages: pages.length,
      A: conformidadeA,
      AA: conformidadeAA,
      AAA: conformidadeAAA
    }
    websiteList.push(websiteForList)


    const websiteForWebsitePage = {
      id: website.WebsiteId,
      name: website.Name,
      startingUrl: website.StartingUrl,
      oldestPage: oldestPage,
      recentPage: recentPage,
      score: typeof (websiteScore / pages.length) !== 'number' ? 0 : websiteScore / pages.length,
      nPages: pages.length,
      pagesWithErrors: pageWithErrors,
      pagesWithoutErrorsA: conformidadeA,
      pagesWithoutErrorsAA: conformidadeAA,
      pagesWithoutErrorsAAA: conformidadeAAA,
      pagesWithoutErrors: conformidadeA + conformidadeAA + conformidadeAAA,
      accessibilityPlotData: accessibilityPlot,
      scoreDistributionFrequency: scoreDistributionFrequency,
      errorsDistribution: getTopTenErrors(errors),
      bestPracticesDistribution: getTopTenBestPractices(success),
      errors: errors,
      success: success,
      successDetailsTable: getWebsiteSuccessDetailsTable(success, pages),
      errorsDetailsTable: getWebsiteErrorsDetailsTable(errors, pages),
      pages: pagesTable
    }
    websiteListForWebsitePage.push(websiteForWebsitePage)
  } catch (e) {
    console.log(e)
  }
}



export function createStatisticsObject(data, moment) {
  return {
    score: (data.score != null) && (typeof data.score === "number") ? Math.floor(data.score * 10) / 10 : 0,
    recentPage: moment(data.recentPage).format("LL"),
    oldestPage: moment(data.oldestPage).format("LL"),
    statsTable: [
      data.nPages,
      data.pagesWithoutErrors,
      data.pagesWithErrors,
      data.pagesWithoutErrorsA,
      data.pagesWithoutErrorsAA,
      data.pagesWithoutErrorsAAA
    ]
  }
}


export async function logoutUser(setLoading, setError, navigate, t) {
  setLoading(true)
  if (api.isUserLoggedIn()) {
    const { response, err } = await api.logout()
    removeLocalStorages(navigate)

  } else {
    removeLocalStorages(navigate)
  }
  setLoading(false)
}

export function removeLocalStorages(navigate) {
  console.log('remove localstorages')
  localStorage.removeItem('MM-username');
  localStorage.removeItem('MM-SSID');
  localStorage.removeItem('expires-at');
  localStorage.removeItem('websiteList')
  localStorage.removeItem('websiteListForWebsitePage')
  localStorage.removeItem('evaluation')
  localStorage.removeItem('evaluationUrl')
  localStorage.removeItem("elemData");
  navigate(`${pathUrl}`)
}


export function checkUserHasPage(website, websitesList, pageName) {
  const targetObject = websitesList.find(obj => obj.name === website);
  if (targetObject) {
    const pageObject = targetObject.pages.find(obj => obj.Uri === pageName);
    if (pageObject) {
      return true
    }
  }
  return false
}


export function getBarLineGraph(t, dataForLine, dataForBar, websiteStats, theme) {
  const headersBarLine = ['[1 - 2[', '[2 - 3[', '[3 - 4[', '[4 - 5[', '[5 - 6[', '[6 - 7[', '[7 - 8[', '[8 - 9[', '[9 - 10[']

  const dataBarLine = {
    labels: headersBarLine,
    datasets: [
      {
        type: 'line',
        label: t("DIALOGS.scores.cumulative"),
        data: dataForLine,
        backgroundColor: 'rgba(51, 51, 153, 1)',
        borderColor: 'rgba(51, 51, 153, 1)',
        borderWidth: 2,
        fill: false,
        tension: 0,
        pointBackgroundColor: 'red', // Set the color of the dots
        pointBorderColor: 'red',     // Set the border color of the dots
      },
      {
        type: 'bar',
        label: t("DIALOGS.scores.frequency"),
        data: dataForBar,
        backgroundColor: [
          '#e90018',
          '#e90018',
          '#f38e10',
          '#f38e10',
          '#f3d609',
          '#f3d609',
          '#f3d609',
          '#15ac51',
          '#15ac51'
        ],
        borderWidth: 0,
      }
    ]
  };

  const optionsBarLine = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white', // Color of the legend text
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.type === 'bar') {
              // Format the tooltip for bar dataset
              const nPages = (context.raw * websiteStats.statsTable[0] / 100).toFixed(0) ?? 0
              return [
                `${label}${context.raw}%`,      // Main value
                `${t("DIALOGS.scores.frequency")}: ${nPages}` // Additional value
              ];
            } else if (context.dataset.type === 'line') {
              // Format the tooltip for line dataset
              const nPages = (context.raw * websiteStats.statsTable[0] / 100).toFixed(0) ?? 0
              return [
                `${label}${context.raw}%`,      // Main value
                `${t("DIALOGS.scores.percentage")}: ${nPages}` // Additional value
              ];
            }
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: t("DIALOGS.scores.range"),
          color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white', // Color of Title on X axis
          font: {
            size: 14
          }
        },
        ticks: {
          font: {
            size: 14
          },
          color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white' // Color of Text on X axis
        },
        grid: {
          color: theme === "light" ? 'rgba(0,0,0, 0.1)' : 'rgba(255, 255, 255, 0.2)' // Color of Dividers vertically
        }
      },
      y: {
        min: 0,
        max: 100,
        title: {
          display: true,
          text: t("DIALOGS.scores.percentage_label"),
          color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white', // Color of Title on Y axis
          font: {
            size: 14
          }
        },
        ticks: {
          font: {
            size: 14,
          },
          color: theme === "light" ? 'rgba(0,0,0, 1)' : 'white' // Color of Text on Y axis
        },
        grid: {
          color: theme === "light" ? 'rgba(0,0,0, 0.1)' : 'rgba(255, 255, 255, 0.2)' // Color of Dividers horizontaly
        }
      }
    }
  };

  return { headersBarLine, dataBarLine, optionsBarLine }
}

export function getBarLineTable(t) {
  const dataHeaders = [
    [
      { type: "Text", name: t("DIALOGS.scores.range") },
      { type: "Text", name: t("DIALOGS.scores.frequency"), justifyCenter: true },
      { type: "Text", name: t("DIALOGS.scores.frequency") + " (%)", justifyCenter: true },
      { type: "Text", name: t("DIALOGS.scores.cumulative"), justifyCenter: true },
      { type: "Text", name: t("DIALOGS.scores.cumulative") + " (%)", justifyCenter: true },
    ]
  ]

  const columnsOptions = {
    range: { type: "Text", center: false, bold: false, decimalPlace: false },
    frequency: { type: "Number", center: true, bold: false, decimalPlace: false },
    frequency_percent: { type: "Text", center: true, bold: false, decimalPlace: false },
    cumulative: { type: "Number", center: true, bold: false, decimalPlace: false },
    cumulative_percent: { type: "Text", center: true, bold: false, decimalPlace: false },
  }

  return { dataHeaders, columnsOptions }
}

export function getRadarGraph(t, theme, labelsForRadar, data) {
  const options = {
    scales: {
      r: {
        min: 0,
        max: 10,
        grid: {
          color: theme === "light" ? "lightgrey" : 'lightgrey', // Color of the grid lines
        },
        angleLines: {
          color: theme === "light" ? "lightgrey" : 'lightgrey', // Color of the angle lines
        },
        ticks: {
          backdropColor: theme === "light" ? "transparent" : '#2c3241', // Background color for the tick labels
          color: theme === "light" ? "black" : 'white', // Color of the tick labels
        },
      },
    },
    plugins: {
      legend: {
        labels: {
          color: theme === "light" ? "black" : '#b6dcf6', // Color of the legend text
          font: {
            size: 14,
            family: 'Lato'
          }
        }

      },

    }
  }

  const manchaData = {
    labels: labelsForRadar,
    datasets: [
      {
        label: t("PAGES.accessibility_plot.label"),
        data: data,
        backgroundColor: theme === "light" ? 'rgba(255, 99, 132, 0.2)' : 'rgba(182, 220, 246, 0.2)',
        borderColor: theme === "light" ? 'rgba(255, 99, 132, 1)' : '#b6dcf6',
        borderWidth: 1,
      },
    ],
  };

  return { options, manchaData }
}

export function getRadarTable(t) {
  const dataHeaders = [
    { type: "Text", name: t("PAGES.accessibility_plot.headerTable"), justifyCenter: true },
    { type: "Text", name: t("STATISTICS.score"), justifyCenter: true },
  ]

  let columnsOptions = {
    id: { type: "Number", center: true, bold: false, decimalPlace: false },
    score: { type: "Number", center: true, bold: false, decimalPlace: true }
  }

  return { dataHeaders, columnsOptions }
}



/**
 * Default CSV generator if no custom generator is provided
 * @param {Object} evaluation - The evaluation data
 * @param {boolean} skipHeaders - Whether to skip CSV headers
 * @param {string} website - Website name
 * @returns {string} CSV string
 */


/**
 * Generates detailed CSV content from evaluation data
 * Converted from Angular to React
 * 
 * @param {Object} evaluation - The evaluation object containing processed data
 * @param {boolean} skipLabels - Whether to skip CSV headers
 * @param {string} [website] - Website name (optional)
 * @param {string} [entity] - Entity name (optional) 
 * @param {string} [tag] - Tag name (optional)
 * @param {Function} t - Translation function from react-i18next
 * @returns {string} CSV formatted string
 * 
 * @example
 * // Basic usage
 * const csvContent = generateCSV(evaluation, false, 'example.com', null, null, t);
 * 
 * @example
 * // With entity and tag
 * const csvContent = generateCSV(evaluation, true, 'example.com', 'MyEntity', 'MyTag', t);
 */
export function generateCSV(evaluation, skipLabels, website, entity, tag, t) {
  const data = [];

  let error, level, sc, desc, num;
  const descs = [
    "CSV.date",
    "CSV.errorType",
    "CSV.level",
    "CSV.criteria",
    "CSV.desc",
    "CSV.count",
    "CSV.value",
    "RESULTS.summary.score",
  ];

  if (website) {
    descs.unshift("CSV.website");
  }

  if (entity) {
    descs.unshift("CSV.entity");
  }

  if (tag) {
    descs.unshift("CSV.tag");
  }

  const _eval = evaluation.processed;

  for (const row in _eval["results"]) {
    if (_eval["results"][row]) {
      const rowData = [];
      error = "CSV." +
        (_eval["results"][row]["prio"] === 3
          ? "scoreok"
          : _eval["results"][row]["prio"] === 2
            ? "scorewar"
            : "scorerror");
      level = _eval["results"][row]["lvl"];
      num = _eval["results"][row]["value"];
      desc = "TESTS_RESULTS." +
        _eval["results"][row]["msg"] +
        (num === 1 ? ".s" : ".p");
      sc = tests[_eval["results"][row]["msg"]]["scs"];
      sc = sc.replace(/,/g, " ");

      descs.push(desc, error);
      rowData.push(
        evaluation.page?.data?.rawUrl || evaluation.rawUrl || '',
        evaluation.page?.data?.tot?.info?.date || evaluation.date || '',
        _eval["results"][row]["msg"],
        error,
        level,
        sc,
        desc,
        num === undefined ? 0 : isNaN(parseInt(num)) ? 1 : num,
        !isNaN(parseInt(num)) ? "" : num,
        _eval.metadata.score.replace(".", ",")
      );

      if (website) {
        rowData.unshift(website);
      }

      if (entity) {
        rowData.unshift(entity);
      }

      if (tag) {
        rowData.unshift(tag);
      }

      data.push(rowData);
    }
  }

  const res = {};

  for (const dec of descs || []) {
    res[dec] = t(dec);
  }

  const labels = new Array();

  for (const row in data) {
    if (data[row]) {
      const descColumn = entity || tag ? 8 : website ? 7 : 6;

      data[row][descColumn] = res[data[row][descColumn]].replace(
        "{{value}}",
        data[row][descColumn + 2]
          ? data[row][descColumn + 2]
          : data[row][descColumn + 1]
      );
      data[row][descColumn] = data[row][descColumn].replace(
        new RegExp("<mark>", "g"),
        ""
      );
      data[row][descColumn] = data[row][descColumn].replace(
        new RegExp("</mark>", "g"),
        ""
      );
      data[row][descColumn] = data[row][descColumn].replace(
        new RegExp("<code>", "g"),
        ""
      );
      data[row][descColumn] = data[row][descColumn].replace(
        new RegExp("</code>", "g"),
        ""
      );
      data[row][descColumn] = data[row][descColumn].replace(
        new RegExp("&lt;", "g"),
        ""
      );
      data[row][descColumn] = data[row][descColumn].replace(
        new RegExp("&gt;", "g"),
        ""
      );
      data[row][descColumn - 3] = res[data[row][descColumn - 3]];
    }
  }

  if (tag) {
    labels.push(res["CSV.tag"]);
  }

  if (entity) {
    labels.push(res["CSV.entity"]);
  }

  if (website) {
    labels.push(res["CSV.website"]);
  }

  labels.push("URI");
  labels.push(res["CSV.date"]);
  labels.push("ID");
  labels.push(res["CSV.errorType"]);
  labels.push(res["CSV.level"]);
  labels.push(res["CSV.criteria"]);
  labels.push(res["CSV.desc"]);
  labels.push(res["CSV.count"]);
  labels.push(res["CSV.value"]);
  labels.push(res["RESULTS.summary.score"]);

  let csvContent = !skipLabels ? labels.join(";") + "\r\n" : "";
  for (const row of data || []) {
    csvContent += row.join(";") + "\r\n";
  }

  return csvContent;
}

/**
 * Enhanced website CSV download function that uses the detailed generateCSV function
 * @param {string} website - The website name/identifier
 * @param {boolean} allPages - Whether to include all pages or not
 * @param {string} [entity] - Entity name (optional)
 * @param {string} [tag] - Tag name (optional)
 * @param {Function} t - Translation function from react-i18next
 * @param {Function} [processDataCallback] - Custom data processing function
 * @returns {Promise<void>}
 * 
 * @example
 * // Usage in React component
 * import { downloadWebsiteCSVDetailed } from '../utils/utils';
 * import { useTranslation } from 'react-i18next';
 * 
 * const MyComponent = () => {
 *   const { t } = useTranslation();
 *   
 *   const handleDownload = async () => {
 *     try {
 *       await downloadWebsiteCSVDetailed('example.com', true, 'MyEntity', 'MyTag', t);
 *     } catch (error) {
 *       console.error('Download failed:', error);
 *     }
 *   };
 * };
 */

function convertBytes(length) {
  if (length < 1024) {
    return length + " bytes";
  } else if (length < 1024000) {
    return Math.round(length / 1024) + " KB <em>(" + length + " bytes)</em>";
  } else {
    return (
      Math.round(length / 1048576) + " MB <em>(" + length + " bytes)</em>"
    );
  }
}

function testView(ele, txt, test, color, tot) {
  const item = {};

  item["txt"] = txt;
  item["tot"] = tot ? tot : 0;

  if (ele === "dtdOld") {
    return item;
  }

  if (ele === "w3cValidatorErrors") {
    item["html_validator"] = true;
    item["ele"] =
      "http://validador-html.fccn.pt/check?uri=" +
      encodeURIComponent(this.url);
  } else if (tot || tot > 0) {
    item["ele"] = ele;

    if (
      (test === "aSkip" ||
        test === "langNo" ||
        test === "h1" ||
        test === "titleNo") &&
      color === "err"
    ) {
      delete item["ele"];
    }
  } else if (test === "aSkipFirst") {
    item["ele"] = ele;
  }

  if (test === "ehandBoth" || test === "ehandler") {
    item["ele"] = "ehandBoth";
  }

  return item;
}

function processData(evaluation) {
  console.log("EVALUATION: ", evaluation);
  const tot = evaluation.tot;

  const data = {};
  data["metadata"] = {};
  data["metadata"]["url"] = tot["info"]["url"];
  data["metadata"]["title"] = tot["info"]["title"];
  data["metadata"]["n_elements"] = tot["info"]["htmlTags"];
  data["metadata"]["score"] = tot["info"]["score"];
  data["metadata"]["size"] = convertBytes(tot["info"]["size"]);
  data["metadata"]["last_update"] = tot["info"]["date"];
  data["metadata"]["count_results"] = tot["results"].length;
  data["metadata"]["validator"] = tot.elems["w3cValidator"] === "true";

  data["results"] = [];

  const infoak = {
    A: {
      ok: 0,
      err: 0,
      war: 0,
    },
    AA: {
      ok: 0,
      err: 0,
      war: 0,
    },
    AAA: {
      ok: 0,
      err: 0,
      war: 0,
    },
  };

  for (const test in tests) {
    if (test) {
      if (tot.results[test]) {
        const tes = tests[test]["test"];
        const lev = tests[test]["level"];
        const ref = tests[test]["ref"];
        const ele = tests[test]["elem"];

        let color;

        if (tests_colors[test] === "R") {
          color = "err";
        } else if (tests_colors[test] === "Y") {
          color = "war";
        } else if (tests_colors[test] === "G") {
          color = "ok";
        }

        const level = lev.toUpperCase();

        infoak[level][color]++;

        let tnum;
        if (tot.elems[tes] !== undefined) {
          if (tes === "titleOk") {
            tnum = tot.info.title;
          } else if (tes === "lang") {
            tnum = tot.info.lang;
          } else if (tes === "langNo") {
            tnum = "lang";
          } else if (tes === "titleLong") {
            tnum = tot.info.title.length;
          } else {
            tnum = tot["elems"][tes];
          }
        } else if (tes === "imgAltNo") {
          tnum = tot.elems["img"];
        } else if (tes === "inputLabelNo") {
          tnum = tot.elems["label"];
        } else {
          tnum = tot["elems"][ele];
        }

        const result = {};
        result["test"] = tests[test];
        result["ico"] = "assets/images/ico" + color + ".png";
        result["color"] = color;
        result["lvl"] = level;
        result["msg"] = test;
        result["ref"] = ref;
        const path = ref.startsWith("C")
          ? "css/"
          : ref.startsWith("H")
            ? "html/"
            : ref.startsWith("A")
              ? "aria/"
              : ref.startsWith("S")
                ? "client-side-script/"
                : ref.startsWith("G")
                  ? "general/"
                  : "failures/";
        result["ref_website"] =
          "https://www.w3.org/WAI/WCAG21/Techniques/" + path + ref + ".html";
        result["relation"] =
          tests[test]["ref"] === "F" ? "relationF" : "relationT";
        result["ref_related_sc"] = new Array();
        result["value"] = tnum;
        result["prio"] = color === "ok" ? 3 : color === "err" ? 1 : 2;

        const scstmp = tests[test]["scs"].split(",");
        const li = {};
        for (let s in scstmp) {
          if (s) {
            s = scstmp[s].trim();
            if (s !== "") {
              li["sc"] = s;
              li["lvl"] = scs[s]["1"];
              li["link"] =
                "https://www.w3.org/TR/UNDERSTANDING-WCAG20/" +
                scs[s]["0"] +
                ".html";

              result["ref_related_sc"].push(clone(li));
            }
          }
        }

        /*if (color === "ok" && ele !== "all") {
          result["tech_list"] = this.testView(ele, ele, tes, color, tnum);
        } else {
          result["tech_list"] = this.testView(tes, tes, tes, color, tnum);
        }*/

        result["tech_list"] = testView(tes, tes, tes, color, tnum);

        data["results"].push(result);
      }
    }
  }

  data["infoak"] = infoak;

  return data;
}

/**
 * Requisitos (fornecer via deps):
 *  - api: instância Axios (ex.: axios.create({ baseURL: "..." }))
 *  - processData(evaluation)
 *  - generateCSV(evaluation, appendHeader, website, _unused, directory)
 */
/**
 * Splits concatenated JSON objects that are joined after the pagecode key
 * @param {string} responseText - The raw response text containing concatenated JSONs
 * @returns {Array} Array of parsed JSON objects
 */
function splitConcatenatedJSONs(responseText) {
  const jsonObjects = [];

  try {
    // Look for the pattern where one JSON ends and another begins
    // This typically happens after "pagecode":"..." where the next { starts a new JSON

    let startIndex = 0;
    let braceCount = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < responseText.length; i++) {
      const char = responseText[i];

      if (escapeNext) {
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        continue;
      }

      if (char === '"') {
        inString = !inString;
        continue;
      }

      if (!inString) {
        if (char === '{') {
          braceCount++;
        } else if (char === '}') {
          braceCount--;

          // When we reach the end of a complete JSON object
          if (braceCount === 0) {
            const jsonString = responseText.substring(startIndex, i + 1).trim();

            try {
              const parsedObject = JSON.parse(jsonString);
              jsonObjects.push(parsedObject);

              // Set start index for next JSON object
              startIndex = i + 1;

              // Skip any whitespace between JSON objects
              while (startIndex < responseText.length &&
                /\s/.test(responseText[startIndex])) {
                startIndex++;
              }

              // Update i to continue from the new start position
              i = startIndex - 1; // -1 because the loop will increment

            } catch (parseError) {
              console.warn('Failed to parse individual JSON:', parseError.message);
              console.log('JSON string:', jsonString.substring(0, 200) + '...');
            }
          }
        }
      }
    }

    console.log(`Successfully split into ${jsonObjects.length} JSON objects`);
    return jsonObjects;

  } catch (error) {
    console.error('Error splitting concatenated JSONs:', error);
    // Fallback: try to parse as single JSON
    try {
      return [JSON.parse(responseText)];
    } catch (fallbackError) {
      throw new Error(`Failed to parse response as JSON: ${fallbackError.message}`);
    }
  }
}



/**
 * Downloads CSV data for a single website
 * Converted from Angular to React - matches original downloadWebsiteCSV functionality
 * 
 * @param {string} website - Website name/identifier
 * @param {boolean} allPages - Whether to include all pages or not
 * @param {Function} t - Translation function from react-i18next
 * @param {Object} deps - Dependencies object
 * @returns {Promise<void>}
 */

export async function downloadCSVByDirectory(directories, fileBaseName = "websites") {
  try {
    const unique = new Map(); // WebsiteId -> { WebsiteId, Name }

    for (const directory of directories) {
      try {
        const res = await api.get(`/directory/${encodeURIComponent(directory)}/websites`);
        const websites = res?.data?.result ?? [];
        for (const w of websites) {
          if (w?.WebsiteId == null) continue;
          if (!unique.has(w.WebsiteId)) {
            unique.set(w.WebsiteId, { WebsiteId: w.WebsiteId, Name: w.Name });
          }
        }
      } catch (err) {
        console.warn(`Falha ao buscar diretório "${directory}":`, err?.message || err);
        // continua; só ignora este diretório
      }
    }

    // passa só os únicos
    await downloadCSV([...unique.values()], fileBaseName);
  } catch (error) {
    console.error("Error downloading CSV by directory:", error);
  }
}

// 2) Monta o CSV pedindo info por WebsiteId, com DEDUPE e 5 req/s
export async function downloadCSV(websites, fileBaseName = "websites") {
  try {
    if (!Array.isArray(websites)) {
      throw new Error("O primeiro argumento deve ser um array de websites.");
    }

    // Salvaguarda: deduplica outra vez (caso chamem esta função diretamente)
    const seen = new Set();
    const uniq = [];
    for (const w of websites.sort((a, b) => a.WebsiteId - b.WebsiteId)) {
      const id = w?.WebsiteId;
      if (id == null || seen.has(id)) continue;
      seen.add(id);
      uniq.push(w);
    }

    const headers = [
      "WebsiteId",
      "Name",
      "StartingUrl",
      "Declaration",
      "Declaration_Update_Date",
      "Stamp",
      "Stamp_Update_Date",
      "Creation_Date",
      "Entity",
      "Tags",
      "numberOfPages",
      "averagePoints",
    ];

    const needsQuote = /[\n\r",]/;
    const esc = (v) => {
      const s = (v ?? "").toString().replace(/\r?\n/g, " ");
      return needsQuote.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const CHUNK_SIZE = 30; // 5 req por segundo
    let data = headers.join(",") + "\n";

    for (let i = 0; i < uniq.length; i += CHUNK_SIZE) {
      const startedAt = Date.now();
      const chunk = uniq.slice(i, i + CHUNK_SIZE);

      const results = await Promise.allSettled(
        chunk.map((w) => api.get(`/website/info/${w.WebsiteId}`))
      );

      for (const r of results) {
        if (r.status !== "fulfilled") {
          console.warn("Falha a obter info do website:", r.reason);
          continue;
        }
        const res = r.value;
        if (res?.status !== 200) {
          console.warn("Resposta não-200:", res?.status);
          continue;
        }

        const websiteData = res?.data?.result;
        if (!websiteData) continue;

        const entity =
          (websiteData.entities || [])
            .map((e) => e?.Long_Name)
            .filter(Boolean)
            .join(";") || websiteData.entity || "";

        const tags =
          (websiteData.tags || [])
            .map((t) => t?.Name)
            .filter(Boolean)
            .join(";") || websiteData.tags || "";

        const numberOfPages = websiteData?.Pages ?? websiteData?.numberOfPages ?? "";
        const avgRaw = websiteData?.AverageScore ?? websiteData?.averagePoints ?? 0;
        // Convert NaN to 0 for CSV export
        const avg = isNaN(avgRaw) || !isFinite(avgRaw) ? 0 : avgRaw;

        const line = [
          esc(websiteData?.WebsiteId),
          esc(websiteData?.Name),
          esc(websiteData?.StartingUrl),
          esc(websiteData?.Declaration),
          esc(websiteData?.Declaration_Update_Date),
          esc(websiteData?.Stamp),
          esc(websiteData?.Stamp_Update_Date),
          esc(websiteData?.Creation_Date),
          esc(entity),
          esc(tags),
          esc(numberOfPages),
          esc(avg),
        ].join(",");

        data += line + "\n";
      }

      // pacing p/ 5 rps
      const elapsed = Date.now() - startedAt;
      const remaining = 1000 - elapsed;
      if (remaining > 0 && i + CHUNK_SIZE < uniq.length) {
        await new Promise((r) => setTimeout(r, remaining));
      }
    }

    // Add BOM (Byte Order Mark) for UTF-8 to ensure Excel recognizes encoding correctly
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + data], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileBaseName}.csv`);
  } catch (error) {
    console.error("Error downloading CSV:", error);
  }
}

export async function downloadWebsiteCSV(website, fileBaseName = "evaluation", t) {
  if (!api || typeof api.get !== "function") throw new Error("Provide an Axios instance `api`.");
  if (!tests || typeof tests !== "object") throw new Error("Provide tests map from tests.js.");

  // Fetch pages (expects array of objects like the one you posted)
  const { data, status } = await api.get(`/website/${encodeURIComponent(website)}/user/admin/pages`);
  if (status === 200) {
    const pages = data.result;

    if (!Array.isArray(pages)) throw new Error("API did not return an array of pages.");

    // CSV header (exact order)
    const headers = [
      "URI",
      "Data",
      "ID",
      "Tipo de erro",
      "Nivel de Conformidade",
      "Critério",
      "Descrição",
      "Número de ocorrências",
      "Valor",
      "Pontuação",
    ];

    // --- local helpers (no external helpers created) ---
    const needsQuote = /[\n\r",]/;
    const esc = (v) => {
      const s = (v ?? "").toString().replace(/\r?\n/g, " ");
      return needsQuote.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const toTipo = (res) => {
      const v = String(res || "").toLowerCase();
      if (v === "passed") return "Sucesso";
      if (v === "warning") return "Aviso";
      if (v === "failed" || v === "fail" || v === "erro") return "Erro";
      return "";
    };
    const normLevel = (lvl) => {
      if (!lvl) return "";
      const v = String(lvl).toLowerCase();
      if (v === "a") return "A";
      if (v === "aa") return "AA";
      if (v === "aaa") return "AAA";
      return String(lvl).toUpperCase();
    };
    const formatPontuacao = (val) => {
      const pick = val ?? "";
      if (pick === "") return "0";
      const n = typeof pick === "number" ? pick : Number(String(pick).replace(",", "."));
      // Convert NaN to 0 for CSV export
      if (!Number.isFinite(n) || isNaN(n)) return "0";
      return String(n.toFixed(1)).replace(".", ",");
    };
    const decodeTot = (b64) => {
      if (!b64 || typeof b64 !== "string") return null;
      try {
        const bin = atob(b64);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const jsonStr = new TextDecoder("utf-8").decode(bytes);
        return JSON.parse(jsonStr);
      } catch {
        return null;
      }
    };
    const splitValueCount = (val) => {
      // expected like "6.6@4" -> { value: "6.6", count: "4" }
      if (typeof val !== "string") return { value: "", count: "" };
      const m = val.match(/^\s*([+-]?\d+(?:\.\d+)?)\s*@\s*([+-]?\d+(?:\.\d+)?)\s*$/);
      if (!m) return { value: "", count: "" };
      return { value: m[1], count: m[2] };
    };

    let csv = headers.join(",") + "\n";

    for (const page of pages) {
      const totDecoded = decodeTot(page?.Tot);
      const results = totDecoded?.results && typeof totDecoded.results === "object"
        ? totDecoded.results
        : {};

      // Choose URI, date, and score
      const uri = page?.Uri ?? totDecoded?.info?.url ?? "";
      const date = page?.Evaluation_Date ?? totDecoded?.info?.date ?? "";
      const scoreRaw = page?.Score ?? totDecoded?.info?.score ?? 0;
      // Convert NaN to 0 for CSV export
      const score = isNaN(scoreRaw) || !isFinite(scoreRaw) ? 0 : scoreRaw;

      // For each test key inside Tot.results, emit a CSV row
      for (const [testId, rawVal] of Object.entries(results)) {
        const def = tests[testId] || {};
        const tipo = toTipo(def.result);
        const nivel = normLevel(def.level);
        const criterio = def.scs || "";

        // Try to extract value/occurrences if looks like "num@count"
        const { value, count } = splitValueCount(String(rawVal));

        const row = [
          esc(uri),                 // URI
          esc(date),                // Data
          esc(testId),              // ID
          esc(tipo),                // Tipo de erro
          esc(nivel),               // Nivel de Conformidade
          esc(criterio),            // Critério
          esc(t(`TESTS_RESULTS.${testId}.s`)),                  // Descrição (não fornecida nas entradas)
          esc(count),               // Número de ocorrências
          esc(value),               // Valor
          formatPontuacao(score),   // Pontuação (decimal com vírgula)
        ].join(",");

        csv += row + "\n";
      }
    }

    // Add BOM (Byte Order Mark) for UTF-8 to ensure Excel recognizes encoding correctly
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `${fileBaseName}.csv`);
  } else {
    return null;
  }
}
export function exportDirectoryEvaluationCSV(rows, directory, opts = {}) {
  if (!Array.isArray(rows)) {
    throw new Error("O primeiro argumento deve ser um array de entradas do diretório.");
  }

  const delimiter = opts.delimiter ?? ";";
  const $saveAs = opts.saveAsImpl || saveAs;

  const headers = [
    "Nome do Directorio",
    "Numero de entidades",
    "Numero de sitios webs",
    "Numero de Paginas",
    "Pontuação media",
  ];

  const needsQuote = new RegExp(`[\\n\\r"${delimiter}]`);
  const esc = (v) => {
    const s = (v ?? "").toString().replace(/\r?\n/g, " ");
    return needsQuote.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const num = (v) => {
    const n = Number(v);
    // Convert NaN to 0 for CSV export
    return Number.isFinite(n) ? String(v) : "0";
  };

  let data = headers.join(delimiter) + "\n";

  for (const d of rows) {
    const line = [
      esc(d?.name),
      esc(num(d?.nEntities)),
      esc(num(d?.nWebsites)),
      esc(num(d?.nPages)),
      esc(num(d?.score)),
    ].join(delimiter);
    data += line + "\n";
  }

  // final exatamente como requereste
  // Add BOM (Byte Order Mark) for UTF-8 to ensure Excel recognizes encoding correctly
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + data], { type: "text/csv;charset=utf-8;" });
  $saveAs(blob, `${directory}_evaluation.csv`);
}


export async function downloadCSVBackup(websites, allPages, directory, t, deps = {}, setCounter = () => { }) {
  const { saveAsImpl } = deps;
  const $saveAs = saveAsImpl || saveAs;
  let counter = 0;
  let data = "";
  let i = 0;

  for (const website of websites) {
    console.log(`\n=== Processing website: ${website} ===`);

    const path = `/evaluation/website/${encodeURIComponent(website)}/evaluations/${String(allPages)}`;

    let res;
    try {
      // Force text response to handle concatenated JSONs
      res = await api.get(path, {
        responseType: 'text',
        headers: {
          'Accept': 'application/json, text/plain, */*'
        }
      });
    } catch (err) {
      console.error(`Failed to fetch ${path}:`, err?.message || err);
      continue; // Skip this website and continue with others
    }

    // Parse the concatenated JSON response
    let jsonObjects;
    if (directory.includes("Global")) {
      jsonObjects = [JSON.parse(res.data)];
    } else {
      try {
        jsonObjects = splitConcatenatedJSONs(res.data);
        console.log(`Parsed ${jsonObjects.length} JSON objects for ${website}`);
      } catch (parseError) {
        console.error(`Failed to parse JSON for ${website}:`, parseError.message);
        continue; // Skip this website and continue with others
      }
    }
    // Process each JSON object (each represents a page evaluation)
    for (const pageData of jsonObjects) {
      // Extract the evaluation data structure
      const evaluationData = pageData.data || pageData;

      // Create the evaluation object for CSV generation
      const evaluation = {
        page: pageData,
        processed: processData(evaluationData)
      };

      // Only process if we have results
      if (!evaluation.processed.results || Object.keys(evaluation.processed.results).length === 0) {
        console.warn(`No results found for page in website ${website}, skipping...`);
        continue;
      }

      // Generate CSV for this page
      const pageCSV = generateCSV(
        evaluation,
        i !== 0, // skip headers for subsequent pages
        website,
        undefined, // no entity
        directory, // directory as tag
        t
      );

      console.log("Generated CSV:", pageCSV);
      data += pageCSV;
      i++;
    }

  }

  if (!data.trim()) {
    throw new Error('No data was retrieved for any website in the directory');
  }

  console.log(`\nGenerating CSV file with ${data.split('\n').length} lines`);
  // Add BOM (Byte Order Mark) for UTF-8 to ensure Excel recognizes encoding correctly
  const BOM = "\uFEFF";
  const blob = new Blob([BOM + data], { type: "text/csv;charset=utf-8;" });
  $saveAs(blob, `${directory}_evaluation.csv`);

  console.log(`Successfully downloaded CSV for ${websites.length} websites in directory: ${directory}`);
}

/**
 * Group practices by each success criteria code.
 *
 * @param {Array<{
*   practice: string,
*   websites: number,
*   successCriteria: string[]
* }>} practiceTable
*
* @returns {Array<{
*   practices: Array<{ title_key: string, websiteCount: number }>,
*   successCriteria: string
* }>}
*/
export function groupPracticesBySuccessCriteria(practiceTable = []) {
 // Map<successCriteria, Map<practiceCode, websiteCount>>
 const bySC = new Map();

 for (const row of practiceTable) {
   const code = row?.practice;
   const websites = Number(row?.websites) || 0;
   const scList = Array.isArray(row?.successCriteria) ? row.successCriteria : [];

   if (!code || scList.length === 0) continue;

   for (const sc of scList) {
     if (!bySC.has(sc)) bySC.set(sc, new Map());
     const inner = bySC.get(sc);
     inner.set(code, (inner.get(code) || 0) + websites);
   }
 }

 // Build requested shape with corrected keys
 const result = [];
 for (const [sc, inner] of bySC.entries()) {
   const practices = Array.from(inner.entries())
     .map(([title_key, websiteCount]) => ({ title_key, websiteCount }))
     .sort((a, b) => b.websiteCount - a.websiteCount || a.title_key.localeCompare(b.title_key));

   result.push({ practices, successCriteria: sc });
 }

 // Optional: sort groups by success criteria code
 result.sort((a, b) =>
   a.successCriteria.localeCompare(b.successCriteria, undefined, { numeric: true, sensitivity: "base" })
 );

 return result;
}
