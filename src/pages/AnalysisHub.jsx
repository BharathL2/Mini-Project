import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function AnalysisHub() {
  const [tabValue, setTabValue] = useState(0);
  const [selectedYear, setSelectedYear] = useState('2020');
  const [selectedState, setSelectedState] = useState('');
  const [data, setData] = useState({
    institutions: [],
    states: [],
    years: [],
    byState: {},
    byYear: {},
    stateCounts: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const files = [
          { name: 'University', path: '/data/nirf_University.csv' },
          { name: 'Engineering', path: '/data/nirf_engineering.csv' },
          { name: 'Pharmacy', path: '/data/nirf_pharmacy.csv' },
          { name: 'Management', path: '/data/nirf_Managementy.csv' },
        ];

        const institutions = [];
        const stateSet = new Set();
        const yearSet = new Set();
        const byState = {};
        const byYear = {};
        const stateCounts = {};
        
        // Keep track of unique institutions to prevent duplicates
        const uniqueInstitutionTracker = new Map();

        for (const file of files) {
          const response = await fetch(file.path);
          const csvText = await response.text();
          
          const { data: parsedData } = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
          });

          parsedData.forEach(row => {
            // Extract key data, ensuring values are properly cleaned
            let name = row.Name || row.name || '';
            if (typeof name === 'string') {
              name = name.replace(/[\d\(\)\"\']+/g, '').trim();
            }
            
            const score = parseFloat(row.Score || row.score || 0);
            const rank = parseInt(row.Rank || row.rank || 0);
            const state = (row.State || row.state || 'Unknown').trim();
            const year = parseInt(row.Year || row.year || 2020);
            
            if (name && !isNaN(score) && !isNaN(rank) && score > 0) {
              const institution = {
                name,
                score,
                rank,
                state,
                year,
                category: file.name
              };
              
              institutions.push(institution);
              stateSet.add(state);
              yearSet.add(year);
              
              // Group by state
              if (!byState[state]) {
                byState[state] = [];
              }
              byState[state].push(institution);
              
              // Group by year
              if (!byYear[year]) {
                byYear[year] = [];
              }
              byYear[year].push(institution);
              
              // Count institutions by state, but only count each unique institution once
              const institutionKey = `${name}-${state}-${file.name}`;
              if (!uniqueInstitutionTracker.has(institutionKey)) {
                uniqueInstitutionTracker.set(institutionKey, true);
                
                if (!stateCounts[state]) {
                  stateCounts[state] = 0;
                }
                stateCounts[state]++;
              }
            }
          });
        }
        
        // Sort institutions within each state by score
        Object.keys(byState).forEach(state => {
          byState[state].sort((a, b) => b.score - a.score);
        });
        
        // Sort institutions within each year by score
        Object.keys(byYear).forEach(year => {
          byYear[year].sort((a, b) => b.score - a.score);
        });
        
        const states = Array.from(stateSet).sort();
        const years = Array.from(yearSet).sort();
        
        if (states.length > 0 && !selectedState) {
          setSelectedState(states[0]);
        }
        
        setData({
          institutions,
          states,
          years,
          byState,
          byYear,
          stateCounts
        });
        
        setError('');
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const renderStateDistribution = () => {
    if (!data.states.length) return null;
    
    // Get top 10 states by institution count
    const topStates = [...data.states]
      .sort((a, b) => (data.stateCounts[b] || 0) - (data.stateCounts[a] || 0))
      .slice(0, 10);
    
    const stateData = {
      labels: topStates.map(state => state),
      datasets: [
        {
          label: 'Number of Institutions',
          data: topStates.map(state => data.stateCounts[state] || 0),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `Institutions: ${context.raw}`;
            }
          }
        },
        title: {
          display: true,
          text: 'Top 10 States by Number of Institutions',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Number of Institutions'
          }
        },
        x: {
          title: {
            display: true,
            text: 'State'
          },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 45
          }
        }
      },
    };
    
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top 10 States by Number of Institutions
          </Typography>
          <Box sx={{ height: 400 }}>
            <Bar data={stateData} options={options} />
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  const renderTopInstitutionsByState = () => {
    if (!selectedState || !data.byState[selectedState]) return null;
    
    // Get top 10 institutions for the selected state
    const topInstitutions = data.byState[selectedState]
      .filter(inst => inst.year.toString() === selectedYear)
      .slice(0, 10);
    
    if (topInstitutions.length === 0) {
      return (
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mt: 4 }}>
          No data available for {selectedState} in {selectedYear}
        </Typography>
      );
    }
    
    // Format institution names for better display
    const formatInstitutionName = (name) => {
      // Keep only first 25 characters and add ellipsis if longer
      if (name.length > 25) {
        return name.substring(0, 25) + '...';
      }
      return name;
    };
    
    const chartData = {
      labels: topInstitutions.map(inst => formatInstitutionName(inst.name)),
      datasets: [
        {
          label: 'Score',
          data: topInstitutions.map(inst => inst.score),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      plugins: {
        legend: {
          position: 'top',
        },
        tooltip: {
          callbacks: {
            title: function(tooltipItems) {
              // Show full institution name in tooltip
              const index = tooltipItems[0].dataIndex;
              return topInstitutions[index].name;
            },
            label: function(context) {
              const institution = topInstitutions[context.dataIndex];
              return [
                `Score: ${context.raw.toFixed(2)}`,
                `Rank: ${institution.rank}`,
                `Category: ${institution.category}`
              ];
            }
          }
        },
        title: {
          display: true,
          text: `Top Institutions in ${selectedState} (${selectedYear})`,
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: 'Institution'
          }
        },
        x: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Score'
          }
        }
      },
    };
    
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Top Institutions in {selectedState} ({selectedYear})
          </Typography>
          <Box sx={{ height: 500 }}>
            <Bar data={chartData} options={options} />
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  const renderYearlyTrends = () => {
    if (!data.years.length) return null;
    
    // Get average scores by year for visualization
    const yearlyData = data.years.map(year => {
      const institutions = data.byYear[year] || [];
      const avgScore = institutions.length > 0 
        ? institutions.reduce((sum, inst) => sum + inst.score, 0) / institutions.length
        : 0;
      
      return {
        year,
        avgScore: parseFloat(avgScore.toFixed(2))
      };
    });
    
    const chartData = {
      labels: yearlyData.map(item => item.year),
      datasets: [
        {
          label: 'Average Score',
          data: yearlyData.map(item => item.avgScore),
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
        },
      ],
    };
    
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
        },
        title: {
          display: true,
          text: 'Average Score Trends Over Years',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Average Score'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Year'
          }
        }
      },
    };
    
    return (
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Score Trends Over Time
          </Typography>
          <Box sx={{ height: 400 }}>
            <Bar data={chartData} options={options} />
          </Box>
        </CardContent>
      </Card>
    );
  };
  
  const renderDetailsList = () => {
    if (!selectedState || !data.byState[selectedState]) return null;
    
    // Get top institutions for the selected state and year
    const institutions = data.byState[selectedState]
      .filter(inst => inst.year.toString() === selectedYear)
      .slice(0, 10);
    
    if (institutions.length === 0) {
      return null;
    }
    
    return (
      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Detailed Rankings - {selectedState} ({selectedYear})
          </Typography>
          <Grid container spacing={2}>
            {institutions.map((inst, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Paper elevation={2} sx={{ p: 2 }}>
                  <Typography variant="subtitle1" color="primary">
                    {index + 1}. {inst.name}
                  </Typography>
                  <Typography variant="body2">
                    Score: {inst.score.toFixed(2)}
                  </Typography>
                  <Typography variant="body2">
                    Rank: {inst.rank}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Category: {inst.category}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Analysis Hub
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Explore rankings and performance metrics across categories and states
        </Typography>

        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center" sx={{ my: 4 }}>
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="analysis tabs">
                <Tab label="State Analysis" />
                <Tab label="Yearly Trends" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {renderStateDistribution()}
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Select State and Year
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Year</InputLabel>
                      <Select
                        value={selectedYear}
                        label="Year"
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        {data.years.map(year => (
                          <MenuItem key={year} value={year.toString()}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>State</InputLabel>
                      <Select
                        value={selectedState}
                        label="State"
                        onChange={(e) => setSelectedState(e.target.value)}
                      >
                        {data.states
                          .slice()
                          .sort((a, b) => (data.stateCounts[b] || 0) - (data.stateCounts[a] || 0))
                          .map(state => (
                            <MenuItem key={state} value={state}>
                              {state} ({data.stateCounts[state] || 0})
                            </MenuItem>
                          ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
              
              {renderTopInstitutionsByState()}
              {renderDetailsList()}
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              {renderYearlyTrends()}
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Select Year
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <FormControl fullWidth>
                      <InputLabel>Year</InputLabel>
                      <Select
                        value={selectedYear}
                        label="Year"
                        onChange={(e) => setSelectedYear(e.target.value)}
                      >
                        {data.years.map(year => (
                          <MenuItem key={year} value={year.toString()}>
                            {year}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Box>
            </TabPanel>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default AnalysisHub; 