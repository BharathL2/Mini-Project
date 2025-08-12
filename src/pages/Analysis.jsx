import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
} from '@mui/material';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function Analysis() {
  const [selectedCategory, setSelectedCategory] = useState('University');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [data, setData] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch(`/data/nirf_${selectedCategory.toLowerCase()}.csv`);
        const csvData = await response.text();
        const processedData = processCSVData(csvData);
        setData(processedData);
        
        // Get unique institutions
        const uniqueInstitutions = [...new Set(processedData.map(item => item.Institute_ID))];
        setInstitutions(uniqueInstitutions);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, [selectedCategory]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getParameterData = (institutionId) => {
    const institutionData = data.filter(item => item.Institute_ID === institutionId);
    return institutionData.map(item => ({
      year: item.Year,
      TLR: parseFloat(item.TLR),
      RPC: parseFloat(item.RPC),
      GO: parseFloat(item.GO),
      OI: parseFloat(item.OI),
      Perception: parseFloat(item.Perception),
    }));
  };

  const getRadarData = (institutionId) => {
    const latestData = data
      .filter(item => item.Institute_ID === institutionId)
      .sort((a, b) => b.Year - a.Year)[0];

    if (!latestData) return [];

    return [
      {
        parameter: 'TLR',
        value: parseFloat(latestData.TLR),
      },
      {
        parameter: 'RPC',
        value: parseFloat(latestData.RPC),
      },
      {
        parameter: 'GO',
        value: parseFloat(latestData.GO),
      },
      {
        parameter: 'OI',
        value: parseFloat(latestData.OI),
      },
      {
        parameter: 'Perception',
        value: parseFloat(latestData.Perception),
      },
    ];
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Detailed Analysis
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                label="Category"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="University">University</MenuItem>
                <MenuItem value="Engineering">Engineering</MenuItem>
                <MenuItem value="Pharmacy">Pharmacy</MenuItem>
                <MenuItem value="Management">Management</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Institution</InputLabel>
              <Select
                value={selectedInstitution}
                label="Institution"
                onChange={(e) => setSelectedInstitution(e.target.value)}
              >
                {institutions.map((institution) => (
                  <MenuItem key={institution} value={institution}>
                    {institution}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="Parameter Analysis" />
              <Tab label="Trend Analysis" />
              <Tab label="Comparison" />
            </Tabs>

            {tabValue === 0 && selectedInstitution && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Parameter Analysis
                </Typography>
                <RadarChart
                  outerRadius={90}
                  width={600}
                  height={300}
                  data={getRadarData(selectedInstitution)}
                >
                  <PolarGrid />
                  <PolarAngleAxis dataKey="parameter" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar
                    name="Score"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </Box>
            )}

            {tabValue === 1 && selectedInstitution && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Trend Analysis
                </Typography>
                <LineChart
                  width={600}
                  height={300}
                  data={getParameterData(selectedInstitution)}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="TLR" stroke="#8884d8" />
                  <Line type="monotone" dataKey="RPC" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="GO" stroke="#ffc658" />
                  <Line type="monotone" dataKey="OI" stroke="#ff7300" />
                  <Line type="monotone" dataKey="Perception" stroke="#ff0000" />
                </LineChart>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Analysis; 