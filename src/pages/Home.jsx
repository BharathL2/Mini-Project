import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import { Link } from 'react-router-dom';
import SchoolIcon from '@mui/icons-material/School';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import InsightsIcon from '@mui/icons-material/Insights';
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

function Home() {
  const [selectedYear, setSelectedYear] = useState('2020'); // Default to 2020
  const [selectedCategory, setSelectedCategory] = useState('University');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [years, setYears] = useState([]);
  const [categories, setCategories] = useState([
    'University',
    'Engineering',
    'Management',
    'Pharmacy'
  ]);

  // Fetch data for the chart
  useEffect(() => {
    const fetchTopInstitutions = async () => {
      try {
        setLoading(true);
        
        let filePath = '';
        switch (selectedCategory) {
          case 'University':
            filePath = '/data/nirf_University.csv';
            break;
          case 'Engineering':
            filePath = '/data/nirf_engineering.csv';
            break;
          case 'Management':
            filePath = '/data/nirf_Managementy.csv';
            break;
          case 'Pharmacy':
            filePath = '/data/nirf_pharmacy.csv';
            break;
          default:
            filePath = '/data/nirf_University.csv';
        }
        
        const response = await fetch(filePath);
        const csvText = await response.text();
        
        const { data: parsedData } = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });
        
        // Extract available years from the data
        const availableYears = [...new Set(parsedData
          .map(row => row.Year || row.year)
          .filter(year => year && !isNaN(parseInt(year)))
          .map(year => parseInt(year))
        )].sort();
        
        if (availableYears.length > 0 && !availableYears.includes(parseInt(selectedYear))) {
          setSelectedYear(availableYears[availableYears.length - 1].toString());
        }
        
        setYears(availableYears);
        
        // Filter by selected year
        const yearData = parsedData.filter(row => {
          const year = row.Year || row.year;
          return year === selectedYear;
        });
        
        // Clean and sort data
        const cleanedData = yearData
          .map(row => {
            // Clean name and extract score
            let name = row.Name || row.name || '';
            if (typeof name === 'string') {
              name = name.replace(/\([^)]*\)/g, '').trim(); // Remove parentheses and their contents
            }
            
            const score = parseFloat(row.Score || row.score || 0);
            const rank = parseInt(row.Rank || row.rank || 0);
            
            return { name, score, rank };
          })
          .filter(item => item.name && !isNaN(item.score) && item.score > 0) // Filter valid entries
          .sort((a, b) => b.score - a.score) // Sort by score descending
          .slice(0, 10); // Get top 10
        
        // Prepare chart data
        const labels = cleanedData.map(item => 
          item.name.length > 25 ? item.name.substring(0, 25) + '...' : item.name
        );
        
        const data = {
          labels,
          datasets: [
            {
              label: 'Score',
              data: cleanedData.map(item => item.score),
              backgroundColor: 'rgba(53, 162, 235, 0.8)',
              borderColor: 'rgb(53, 162, 235)',
              borderWidth: 1,
            },
          ],
        };
        
        setChartData({
          data,
          institutions: cleanedData,
        });
        
        setError('');
      } catch (err) {
        console.error('Error loading chart data:', err);
        setError('Failed to load institution data. Please try again later.');
        setChartData(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopInstitutions();
  }, [selectedYear, selectedCategory]);
  
  const features = [
    {
      title: 'Explore Rankings',
      description: 'Browse through comprehensive rankings of institutions across different categories',
      icon: <SchoolIcon fontSize="large" />,
      link: '/explore-rankings',
    },
    {
      title: 'Analysis Hub',
      description: 'Deep dive into data analytics and trends in higher education',
      icon: <AnalyticsIcon fontSize="large" />,
      link: '/analysis-hub',
    },
    {
      title: 'Compare Institutions',
      description: 'Compare multiple institutions side by side across various parameters',
      icon: <CompareArrowsIcon fontSize="large" />,
      link: '/compare-institutions',
    },
    {
      title: 'Insights',
      description: 'Discover key insights and patterns in institutional performance',
      icon: <InsightsIcon fontSize="large" />,
      link: '/insights',
    },
  ];

  const stats = [
    { label: 'Total Institutions', value: '3,500+' },
    { label: 'Categories', value: '4' },
    { label: 'Years of Data', value: '8' },
    { label: 'Parameters', value: '15+' },
  ];

  // Render chart options
  const chartOptions = {
    indexAxis: 'y', // Horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          title: function(tooltipItems) {
            const index = tooltipItems[0].dataIndex;
            return chartData?.institutions[index]?.name || '';
          },
          label: function(context) {
            const institution = chartData?.institutions[context.dataIndex];
            return [
              `Score: ${context.raw.toFixed(2)}`,
              `Rank: ${institution?.rank || 'N/A'}`
            ];
          }
        }
      },
      title: {
        display: true,
        text: `Top 10 ${selectedCategory} Institutions (${selectedYear})`,
        font: {
          size: 16
        }
      },
    },
    scales: {
      y: {
        ticks: {
          callback: function(value, index, ticks) {
            return index + 1 + '. ' + this.getLabelForValue(value);
          }
        }
      },
      x: {
        title: {
          display: true,
          text: 'Score'
        },
        beginAtZero: true,
        suggestedMax: 100
      }
    },
  };

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            <Grid item xs={12} md={8} textAlign="center">
              <Typography variant="h2" component="h1" gutterBottom>
                Indian Higher Education Analytics
              </Typography>
              <Typography variant="h5" paragraph>
                Explore, analyze, and compare NIRF rankings and institutional performance metrics
              </Typography>
              <Button
                component={Link}
                to="/explore-rankings"
                variant="contained"
                color="secondary"
                size="large"
                sx={{ mt: 2 }}
              >
                Start Exploring
              </Button>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Typography variant="h3" component="div" color="primary" gutterBottom>
                  {stat.value}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Top Institutions Chart Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Top Institutions Rankings
        </Typography>
        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  label="Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  label="Year"
                  onChange={(e) => setSelectedYear(e.target.value)}
                  disabled={years.length === 0}
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year.toString()}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ height: 600, position: 'relative' }}>
            {loading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'rgba(255, 255, 255, 0.7)',
                zIndex: 1 
              }}>
                <CircularProgress />
              </Box>
            )}
            
            {error && (
              <Box sx={{ 
                height: '100%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Typography color="error">{error}</Typography>
              </Box>
            )}
            
            {!loading && !error && chartData && (
              <Bar options={chartOptions} data={chartData.data} />
            )}
          </Box>
        </Paper>
      </Container>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Key Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                component={Link}
                to={feature.link}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}

export default Home; 