import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Autocomplete,
  TextField,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { CompareArrows, Delete } from '@mui/icons-material';
import { Bar } from 'recharts';
import { BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import Papa from 'papaparse';

function CompareInstitutions() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [institutions, setInstitutions] = useState([]);
  const [selectedInstitutions, setSelectedInstitutions] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [comparisonData, setComparisonData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch the files
        const files = [
          { name: 'University', path: '/data/nirf_University.csv' },
          { name: 'Engineering', path: '/data/nirf_engineering.csv' },
          { name: 'Pharmacy', path: '/data/nirf_pharmacy.csv' },
          { name: 'Management', path: '/data/nirf_Managementy.csv' },
        ];

        // Process all files to get institutions and years
        const allData = await Promise.all(
          files.map(async (file) => {
            const response = await fetch(file.path);
            const csvText = await response.text();
            const { data } = Papa.parse(csvText, { header: true });
            return { category: file.name, data };
          })
        );

        // Extract unique years and categories
        const allYears = new Set();
        const allInstitutions = [];

        allData.forEach(categoryData => {
          categoryData.data.forEach(record => {
            if (record.Year) {
              allYears.add(record.Year);
            }
            if (record.Name) {
              allInstitutions.push({
                name: record.Name,
                id: record.Name,
                category: categoryData.category,
                score: record.Score,
                year: record.Year
              });
            }
          });
        });

        setYears(Array.from(allYears).sort((a, b) => b - a));
        setSelectedYear(Array.from(allYears).sort((a, b) => b - a)[0]);
        setCategories(files.map(file => file.name));
        setSelectedCategory('');
        setInstitutions(allInstitutions);
      } catch (err) {
        setError('Failed to load institutions: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    // Filter institutions based on selected category and year
    if (selectedYear || selectedCategory) {
      const filtered = institutions.filter(inst => {
        const yearMatch = !selectedYear || inst.year === selectedYear;
        const categoryMatch = !selectedCategory || inst.category === selectedCategory;
        return yearMatch && categoryMatch;
      });
      
      // Update the comparisonData if institutions are selected
      if (selectedInstitutions.length > 0) {
        updateComparisonData();
      }
    }
  }, [selectedYear, selectedCategory]);

  const handleCompare = () => {
    if (selectedInstitutions.length < 2) {
      setError('Please select at least two institutions to compare');
      return;
    }
    
    updateComparisonData();
  };

  const updateComparisonData = async () => {
    try {
      setLoading(true);
      
      const files = [
        { name: 'University', path: '/data/nirf_University.csv' },
        { name: 'Engineering', path: '/data/nirf_engineering.csv' },
        { name: 'Pharmacy', path: '/data/nirf_pharmacy.csv' },
        { name: 'Management', path: '/data/nirf_Managementy.csv' },
      ];

      // Get detailed data for selected institutions
      const allData = await Promise.all(
        files.map(async (file) => {
          const response = await fetch(file.path);
          const csvText = await response.text();
          const { data } = Papa.parse(csvText, { header: true });
          return { category: file.name, data };
        })
      );

      // Find the institution records for the selected year
      const institutionDetails = selectedInstitutions.map(selected => {
        let details = null;
        allData.forEach(categoryData => {
          const found = categoryData.data.find(record => 
            record.Name === selected.name && record.Year === selectedYear
          );
          if (found) {
            details = { ...found, category: categoryData.category };
          }
        });
        return details || { name: selected.name, notFound: true };
      }).filter(item => !item.notFound);

      // Create comparison data objects
      const parameterNames = ['TLR', 'RPC', 'GO', 'OI', 'Perception'];
      
      // Parameter comparison data
      const parameterData = parameterNames.map(param => {
        const data = {};
        institutionDetails.forEach(inst => {
          data[inst.Name] = parseFloat(inst[param] || 0);
        });
        return { parameter: param, ...data };
      });

      // Overall score data
      const overallScores = institutionDetails.map(inst => ({
        name: inst.Name,
        score: parseFloat(inst.Score || 0),
        category: inst.category
      }));

      setComparisonData({
        institutions: institutionDetails,
        parameterData,
        overallScores
      });

      setError('');
    } catch (err) {
      setError('Error comparing institutions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddInstitution = (event, value) => {
    if (!value) return;
    
    if (selectedInstitutions.length >= 3) {
      setError('You can compare up to 3 institutions at a time');
      return;
    }
    
    // Check if the institution is already selected
    if (selectedInstitutions.some(inst => inst.name === value.name)) {
      setError('This institution is already selected');
      return;
    }
    
    setSelectedInstitutions([...selectedInstitutions, value]);
  };

  const handleRemoveInstitution = (index) => {
    const updated = [...selectedInstitutions];
    updated.splice(index, 1);
    setSelectedInstitutions(updated);
  };

  const getFilteredInstitutions = () => {
    return institutions.filter(inst => {
      const yearMatch = !selectedYear || inst.year === selectedYear;
      const categoryMatch = !selectedCategory || inst.category === selectedCategory;
      return yearMatch && categoryMatch;
    });
  };

  return (
    <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Compare Institutions
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Select institutions to compare their performance across different parameters
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Year</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  label="Year"
                >
                  {years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Autocomplete
                options={getFilteredInstitutions()}
                getOptionLabel={(option) => option.name}
                onChange={handleAddInstitution}
                renderInput={(params) => (
                  <TextField {...params} label="Add Institution" fullWidth />
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Selected Institutions
            </Typography>
            {selectedInstitutions.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No institutions selected. Add up to 3 institutions to compare.
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {selectedInstitutions.map((institution, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card variant="outlined">
                      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1">{institution.name}</Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemoveInstitution(index)}
                          startIcon={<Delete />}
                        >
                          Remove
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}

            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<CompareArrows />}
                onClick={handleCompare}
                disabled={selectedInstitutions.length < 2 || loading}
                sx={{ px: 4 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Compare'}
              </Button>
            </Box>
          </Box>
        </Paper>

        {comparisonData && (
          <Box sx={{ mt: 4 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Overall Scores
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={comparisonData.overallScores}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#3b82f6" name="Overall Score" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>

            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                Parameter Comparison
              </Typography>
              {isMobile ? (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData.parameterData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="parameter" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      {comparisonData.institutions.map((inst, index) => (
                        <Bar 
                          key={inst.Name} 
                          dataKey={inst.Name} 
                          fill={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#8b5cf6'} 
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart outerRadius={150} data={comparisonData.parameterData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="parameter" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      {comparisonData.institutions.map((inst, index) => (
                        <Radar 
                          key={inst.Name} 
                          name={inst.Name} 
                          dataKey={inst.Name} 
                          stroke={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#8b5cf6'} 
                          fill={index === 0 ? '#3b82f6' : index === 1 ? '#10b981' : '#8b5cf6'} 
                          fillOpacity={0.3} 
                        />
                      ))}
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Paper>

            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h5" gutterBottom>
                Detailed Comparison
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Parameter</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{inst.Name}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Category</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{inst.category}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{inst.Rank || 'N/A'}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Overall Score</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{parseFloat(inst.Score).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Teaching, Learning & Resources (TLR)</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{parseFloat(inst.TLR || 0).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Research and Professional Practice (RPC)</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{parseFloat(inst.RPC || 0).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Graduation Outcomes (GO)</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{parseFloat(inst.GO || 0).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Outreach and Inclusivity (OI)</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{parseFloat(inst.OI || 0).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                    <TableRow>
                      <TableCell>Perception</TableCell>
                      {comparisonData.institutions.map(inst => (
                        <TableCell key={inst.Name}>{parseFloat(inst.Perception || 0).toFixed(2)}</TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default CompareInstitutions; 