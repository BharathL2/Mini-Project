import Papa from 'papaparse';

// Function to process CSV data
export const processCSVData = (csvData) => {
  const lines = csvData.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    const row = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index]?.trim();
    });
    return row;
  });
};

// Function to filter data by year
export const filterByYear = (data, year) => {
  return data.filter(item => item.Year === year);
};

// Function to filter data by category
export const filterByCategory = (data, category) => {
  return data.filter(item => item.Institute_ID.includes(category));
};

// Function to get top N institutions
export const getTopNInstitutions = (data, n) => {
  return data
    .sort((a, b) => b.Score - a.Score)
    .slice(0, n);
};

// Function to calculate average scores by parameter
export const calculateAverageScores = (data) => {
  const parameters = ['TLR', 'RPC', 'GO', 'OI', 'Perception'];
  const averages = {};
  
  parameters.forEach(param => {
    const sum = data.reduce((acc, item) => acc + parseFloat(item[param] || 0), 0);
    averages[param] = sum / data.length;
  });
  
  return averages;
};

// Function to get institutions by state
export const getInstitutionsByState = (data) => {
  const stateMap = {};
  
  data.forEach(item => {
    const state = item.State;
    if (!stateMap[state]) {
      stateMap[state] = [];
    }
    stateMap[state].push(item);
  });
  
  return stateMap;
};

// Function to calculate year-over-year changes
export const calculateYearOverYearChanges = (data, institutionId) => {
  const institutionData = data.filter(item => item.Institute_ID === institutionId);
  return institutionData.map((item, index) => {
    if (index === 0) return { ...item, rankChange: 0 };
    const prevRank = parseInt(institutionData[index - 1].Rank);
    const currentRank = parseInt(item.Rank);
    return {
      ...item,
      rankChange: prevRank - currentRank
    };
  });
};

export const processNirfData = async (year) => {
  try {
    // Fetch all CSV files
    const files = [
      { name: 'University', path: '/data/nirf_University.csv' },
      { name: 'Engineering', path: '/data/nirf_engineering.csv' },
      { name: 'Pharmacy', path: '/data/nirf_pharmacy.csv' },
      { name: 'Management', path: '/data/nirf_Managementy.csv' },
    ];

    const allData = await Promise.all(
      files.map(async (file) => {
        const response = await fetch(file.path);
        const csvText = await response.text();
        const { data } = Papa.parse(csvText, { header: true });
        return { category: file.name, data };
      })
    );

    // Process data for the selected year
    const yearData = allData.reduce((acc, categoryData) => {
      const yearRecords = categoryData.data.filter(record => record.Year === year);
      return [...acc, ...yearRecords];
    }, []);

    // Get top institutions
    const topInstitutions = yearData
      .sort((a, b) => b.Score - a.Score)
      .slice(0, 10)
      .map(inst => ({
        name: inst.Name,
        score: parseFloat(inst.Score),
        category: inst.Category
      }));

    // Calculate parameter averages with proper parsing
    const parameters = ['TLR', 'RPC', 'GO', 'OI', 'Perception'];
    const parameterData = parameters.map(param => {
      const validRecords = yearData.filter(record => {
        const value = record[param];
        return value && !isNaN(parseFloat(value)) && parseFloat(value) > 0;
      });

      const average = validRecords.length > 0
        ? validRecords.reduce((sum, record) => sum + parseFloat(record[param]), 0) / validRecords.length
        : 0;

      return {
        name: param,
        value: Math.round(average)
      };
    });

    // Calculate regional distribution
    const regions = yearData.reduce((acc, record) => {
      const state = record.State || 'Other';
      acc[state] = (acc[state] || 0) + 1;
      return acc;
    }, {});

    const regionData = Object.entries(regions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));

    // Calculate total institutions and average score
    const validScores = yearData.filter(record => {
      const score = record.Score;
      return score && !isNaN(parseFloat(score)) && parseFloat(score) > 0;
    });

    const totalInstitutions = validScores.length;
    const averageScore = totalInstitutions > 0
      ? validScores.reduce((sum, record) => sum + parseFloat(record.Score), 0) / totalInstitutions
      : 0;

    return {
      topInstitutions,
      parameters: parameterData,
      regions: regionData,
      totalInstitutions,
      averageScore,
      topState: Object.entries(regions).sort(([, a], [, b]) => b - a)[0][0]
    };
  } catch (error) {
    console.error('Error processing NIRF data:', error);
    return null;
  }
}; 