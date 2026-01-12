import moment from "moment";
import { getSimplifiedPracticesData } from "./utils.js";
/**
 * Optimized function to fetch and aggregate data for multiple directories
 * @param {string[]} directoryNames - Array of directory names to aggregate data for
 * @param {function} t - Translation function
 * @returns {Promise<Object>} - Aggregated data object containing all calculated metrics
 */
export const aggregateDirectoriesData = async (directoryNames, api) => {
  try {
    const startTime = performance.now();
      
    // Fetch data for all directories in parallel
    console.log(`Fetching data for ${directoryNames.length} directories...`);
    const directoryDataPromises = directoryNames.map(async (directoryName) => {
      const [websitesResponse, pagesResponse] = await Promise.all([
        api.get(`/directory/${directoryName}/websites`),
        api.get(`/directory/${directoryName}/websites/pages`)
      ]);
      
      return {
        directoryName,
        websites: websitesResponse.data.result || [],
        pages: pagesResponse.data.result || []
      };
    });

    const directoriesData = await Promise.all(directoryDataPromises);
    
    const fetchTime = performance.now();
    console.log(`Data fetching completed in ${(fetchTime - startTime).toFixed(2)}ms`);

    // Combine all pages and websites from all directories
    const allPages = directoriesData.flatMap(dir => dir.pages);
    const allWebsites = directoriesData.flatMap(dir => dir.websites);

    console.log(`Processing ${allPages.length} pages and ${allWebsites.length} websites`);

    // Pre-filter evaluated pages once
    const evaluatedPages = allPages.filter(page => page.Evaluation_Date !== null);
    
    if (evaluatedPages.length === 0) {
      throw new Error("No evaluated pages found across the specified directories");
    }

    // Single pass calculations for better performance
    let totalScore = 0;
    let oldestDate = new Date(evaluatedPages[0].Evaluation_Date);
    let newestDate = new Date(evaluatedPages[0].Evaluation_Date);
    
    // Initialize score distribution buckets
    const scoreDistribution = new Array(9).fill(0);
    
    // Single iteration for multiple calculations
    evaluatedPages.forEach(page => {
      const score = Number(page.Score || 0);
      totalScore += score;
      
      const evalDate = new Date(page.Evaluation_Date);
      if (evalDate < oldestDate) oldestDate = evalDate;
      if (evalDate > newestDate) newestDate = evalDate;
      
      // Calculate score distribution in single pass
      const bucketIndex = Math.min(Math.floor(score) - 1, 8);
      if (bucketIndex >= 0 && bucketIndex < 9) {
        scoreDistribution[bucketIndex]++;
      }
    });

    const averageScore = totalScore / evaluatedPages.length;
    const oldestPage = moment(oldestDate).format('DD/MM/YY');
    const newestPage = moment(newestDate).format('DD/MM/YY');

    // Optimized website grouping and conformance calculation
    const websitePageMap = {};
    const websiteConformanceData = {};
    
    allPages.forEach(page => {
      const websiteId = page.WebsiteId;
      if (!websitePageMap[websiteId]) {
        websitePageMap[websiteId] = [];
        websiteConformanceData[websiteId] = { A: 0, AA: 0, AAA: 0, hasErrors: false };
      }
      websitePageMap[websiteId].push(page);
      
      // Track conformance in single pass
      if (page.A > 0 || page.AA > 0 || page.AAA > 0) {
        websiteConformanceData[websiteId].hasErrors = true;
      }
      websiteConformanceData[websiteId].A += page.A || 0;
      websiteConformanceData[websiteId].AA += page.AA || 0;
      websiteConformanceData[websiteId].AAA += page.AAA || 0;
    });

    const totalWebsites = Object.keys(websitePageMap).length;
    const totalPages = allPages.length;
    const totalEvaluatedPages = evaluatedPages.length;

    // Calculate conformance statistics
    let conformantWebsites = 0;
    let nonConformantWebsites = 0;
    let conformCounts = { A: 0, AA: 0, AAA: 0 };

    Object.entries(websiteConformanceData).forEach(([websiteId, conformanceData]) => {
      if (conformanceData.hasErrors) {
        nonConformantWebsites++;
      } else {
        conformantWebsites++;
        if (conformanceData.A <= 0) conformCounts.A++;
        if (conformanceData.AA <= 0) conformCounts.AA++;
        if (conformanceData.AAA <= 0) conformCounts.AAA++;
      }
    });

    // Calculate directory average scores for radar chart
    const directoryAverageScores = directoriesData.map(directory => {
      const evaluatedPages = directory.pages.filter(p => p.Evaluation_Date !== null);
      const scores = evaluatedPages.map(p => Number(p.Score || 0));
      const average = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      return {
        directoryName: directory.directoryName,
        averageScore: average.toFixed(1)
      };
    });

    // Extract just the scores for radar chart data (maintaining backward compatibility)
    const radarScores = directoryAverageScores.map(dir => dir.averageScore);

    const processingTime = performance.now();
    console.log(`Data processing completed in ${(processingTime - fetchTime).toFixed(2)}ms`);
    console.log('Directory average scores:', directoryAverageScores);

    // Calculate practices data (potentially expensive operation)
    const simplifiedPracticesData = getSimplifiedPracticesData(allPages);
    
    // Group practices by WCAG Success Criteria for better organization
    const practicesBySuccessCriteria = {
      success: {},
      errors: {}
    };

    // Process successful practices
    const dataListDetails = [];
    simplifiedPracticesData.success.forEach(item => {
      dataListDetails.push({
        practice: `ELEMS.${item.practice}`,
        pages: item.pages,
        occurrences: item.occurrences,
        level: item.level.toUpperCase()
      });

      // Group by success criteria (scs is already available in the item)
      const scs = item.scs;
      if (scs && scs !== '') {
        const criteriaList = scs.split(',');
        criteriaList.forEach(criteria => {
          const trimmedCriteria = criteria.trim();
          if (!practicesBySuccessCriteria.success[trimmedCriteria]) {
            practicesBySuccessCriteria.success[trimmedCriteria] = [];
          }
          practicesBySuccessCriteria.success[trimmedCriteria].push({
            practice: `ELEMS.${item.practice}`,
            pages: item.pages,
            occurrences: item.occurrences,
            level: item.level.toUpperCase(),
            websiteCount: item.pages
          });
        });
      }
    });
    
    // Process error practices
    const dataListDetailsBad = [];
    simplifiedPracticesData.errors.forEach(item => {
      dataListDetailsBad.push({
        practice: `ELEMS.${item.practice}`,
        pages: item.pages,
        occurrences: item.occurrences.toString().includes("lang") ? "N/A" : item.occurrences,
        level: item.level.toUpperCase()
      });

      // Group by success criteria (scs is already available in the item)
      const scs = item.scs;
      if (scs && scs !== '') {
        const criteriaList = scs.split(',');
        criteriaList.forEach(criteria => {
          const trimmedCriteria = criteria.trim();
          if (!practicesBySuccessCriteria.errors[trimmedCriteria]) {
            practicesBySuccessCriteria.errors[trimmedCriteria] = [];
          }
          practicesBySuccessCriteria.errors[trimmedCriteria].push({
            practice: `ELEMS.${item.practice}`,
            pages: item.pages,
            occurrences: item.occurrences.toString().includes("lang") ? "N/A" : item.occurrences,
            level: item.level.toUpperCase(),
            websiteCount: item.pages
          });
        });
      }
    });

    // Format data for WCAG Success Criteria display
    const formatSuccessCriteriaData = (practicesData) => {
      const formatted = {};
      Object.keys(practicesData).sort().forEach(criteria => {
        const practices = practicesData[criteria];
        formatted[criteria] = {
          criteriaCode: criteria,
          practiceCount: practices.length,
          practices: practices
        };
      });
      return formatted;
    };

    const successCriteriaSuccess = formatSuccessCriteriaData(practicesBySuccessCriteria.success);
    const successCriteriaErrors = formatSuccessCriteriaData(practicesBySuccessCriteria.errors);

    console.log('Success Criteria - Good Practices:', successCriteriaSuccess);
    console.log('Success Criteria - Error Practices:', successCriteriaErrors);

    // Prepare bar chart data list
    const dataListBar = scoreDistribution.map((frequency, index) => {
      const cumulative = scoreDistribution.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0);
      return {
        range: `[${index + 1} - ${index + 2}[`,
        frequency: frequency,
        frequency_percent: `${((frequency / totalPages) * 100).toFixed(2)}%`,
        cumulative: cumulative,
        cumulative_percent: `${((cumulative / totalPages) * 100).toFixed(2)}%`
      };
    });

    // Prepare websites data for table
    const websitesData = allWebsites.map(item => ({
      id: item.WebsiteId,
      Name: item.Name,
      StartingUrl: item.StartingUrl,
      Pages: item.Pages + "(" + item.Evaluated_Pages + ")",
      Creation_Date: moment(item.Creation_Date).format('DD/MM/YYYY'),
      Declaration: item.Declaration === null ? "Não avaliado" : 
                  item.Declaration === 1 ? "Selo de Ouro" : 
                  item.Declaration === 2 ? "Selo de Prata" : 
                  item.Declaration === 3 ? "Selo de Bronze" : 
                  "Declaração não conforme",
      edit: "Editar",
    }));

    const endTime = performance.now();
    console.log(`Total aggregation completed in ${(endTime - startTime).toFixed(2)}ms`);

    return {
      // Main indicators
      listItems: [
        { title: 'Pontuação média', value: averageScore.toFixed(1) },
        { title: 'Avaliação mais antiga de uma página', value: oldestPage },
        { title: 'Avaliação mais recente de uma página', value: newestPage },
        { title: 'Nº de Sítios Web', value: totalWebsites },
        { title: 'Nº de Diretórios', value: directoriesData.length },
        { title: 'Nº de Páginas(Avaliadas)', value: `${totalPages} (${totalEvaluatedPages})` },
        { title: 'Nº médio de Páginas por Sítio', value: (totalPages / totalWebsites).toFixed(1) },
      ],
      
      // Global conformance indicators
      listItemsGlobal: [
        { title: 'Sítios Web', value: totalWebsites },
        { title: 'Sítios Web não conformes', value: nonConformantWebsites },
        {
          title: 'Sítios Web conformes', value: conformantWebsites,
          itemsList: [
            { title: 'Conformidade A: sem erros de nível A', value: `${conformCounts.A} (${((conformCounts.A / totalWebsites) * 100).toFixed(1)}%)` },
            { title: 'Conformidade AA: sem erros de nível A + AA', value: `${conformCounts.AA} (${((conformCounts.AA / totalWebsites) * 100).toFixed(1)}%)` },
            { title: 'Conformidade AAA: sem erros de nível A + AA + AAA', value: `${conformCounts.AAA} (${((conformCounts.AAA / totalWebsites) * 100).toFixed(1)}%)` },
          ]
        },
      ],
      
      // Chart and table data
      barDataDynamic: scoreDistribution,
      dataListBar,
      dataRadar: radarScores,
      directoryAverageScores, // Include detailed directory scores for potential future use
      dataListDetails,
      dataListDetailsBad,
      websitesData,
      successCriteriaSuccess, // Practices grouped by WCAG Success Criteria
      successCriteriaErrors,  // Error practices grouped by WCAG Success Criteria
      // Raw data for further processing if needed
      allPages,
      allWebsites,
      directoriesData
    };

  } catch (error) {
    console.error('Error aggregating directories data:', error);
    throw error;
  }
};

/**
 * Helper function to get all directory names from the API
 * @returns {Promise<string[]>} - Array of directory names
 */
export const getAllDirectoryNames = async (api) => {
  try {
    const response = await api.get('/directory/all');
    return response.data.result.map(directory => directory.Name);
  } catch (error) {
    console.error('Error fetching directory names:', error);
    throw error;
  }
};

/**
 * Convenience function to aggregate data for all directories
 * @param {function} t - Translation function
 * @returns {Promise<Object>} - Aggregated data for all directories
 */
export const aggregateAllDirectoriesData = async (t, api) => {
  const directoryNames = await getAllDirectoryNames(api);
  return aggregateDirectoriesData(directoryNames, api);
}; 