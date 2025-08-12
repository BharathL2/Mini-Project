import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Autocomplete,
  TextField,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import { 
  LineChart, 
  Line, 
  BarChart,
  Bar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Papa from 'papaparse';

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

function InstitutionProfile() {
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [institutionData, setInstitutionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Define available categories
  const categories = ['All', 'University', 'Engineering', 'Management', 'Pharmacy'];

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#83a6ed'];
  
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        setLoading(true);
        const files = [
          { path: '/data/nirf_University.csv', category: 'University' },
          { path: '/data/nirf_engineering.csv', category: 'Engineering' },
          { path: '/data/nirf_pharmacy.csv', category: 'Pharmacy' },
          { path: '/data/nirf_Managementy.csv', category: 'Management' },
        ];

        // Use a Map to track unique institutions and their categories
        const uniqueInstitutionsMap = new Map();
        // Track institution categories
        const institutionCategories = new Map();

        for (const file of files) {
          try {
            console.log(`Fetching data from ${file.path}...`);
            const response = await fetch(file.path);
            const csvText = await response.text();
            
            console.log(`Parsing CSV from ${file.category}...`);
            const { data: parsedData } = Papa.parse(csvText, {
              header: true,
              skipEmptyLines: true
            });
            
            console.log(`Found ${parsedData.length} rows in ${file.category}`);

            // Debug the first few rows
            if (parsedData.length > 0) {
              console.log(`Sample data from ${file.category}:`, parsedData.slice(0, 2));
            }
            
            parsedData.forEach(row => {
              // Try various column name formats
              let name = row.Name || row.name || row.Institution || row.INSTITUTION || row.institute || '';
              if (typeof name === 'string') {
                // Clean up the name
                name = name.replace(/[\d\(\)\"\']+/g, '').trim();
                
                if (name) {
                  // Track by name and category to handle cases where the same institution
                  // appears in different categories
                  const institutionKey = `${name}-${file.category}`;
                  
                  if (!uniqueInstitutionsMap.has(institutionKey)) {
                    uniqueInstitutionsMap.set(institutionKey, {
                      name,
                      category: file.category,
                      state: row.State || row.state || 'Unknown'
                    });
                  }
                  
                  // Track which categories each institution belongs to
                  if (!institutionCategories.has(name)) {
                    institutionCategories.set(name, []);
                  }
                  
                  const categories = institutionCategories.get(name);
                  if (!categories.includes(file.category)) {
                    categories.push(file.category);
                  }
                }
              }
            });
          } catch (err) {
            console.error(`Error processing file ${file.path}:`, err);
          }
        }

        // Create institutions array with category info
        const institutionsArray = Array.from(uniqueInstitutionsMap.values()).map(inst => ({
          ...inst,
          categories: institutionCategories.get(inst.name) || []
        }));
        
        // Sort alphabetically
        institutionsArray.sort((a, b) => a.name.localeCompare(b.name));
        
        console.log(`Found ${institutionsArray.length} unique institutions`);
        
        setInstitutions(institutionsArray);
        setFilteredInstitutions(institutionsArray);
        setError('');
      } catch (err) {
        console.error('Error loading institutions:', err);
        setError('Failed to load institutions. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchInstitutions();
  }, []);

  // Filter institutions when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredInstitutions(institutions);
    } else {
      setFilteredInstitutions(
        institutions.filter(inst => 
          inst.category === selectedCategory || 
          (inst.categories && inst.categories.includes(selectedCategory))
        )
      );
    }
  }, [selectedCategory, institutions]);

  const handleInstitutionChange = async (event, newValue) => {
    if (!newValue) {
      setSelectedInstitution(null);
      setInstitutionData(null);
      return;
    }
    
    // Find the selected institution object
    const selectedInst = typeof newValue === 'string' 
      ? filteredInstitutions.find(inst => inst.name === newValue)
      : newValue;
    
    if (!selectedInst) return;

    setSelectedInstitution(selectedInst.name);
    setLoading(true);

    try {
      const files = [
        { path: '/data/nirf_University.csv', category: 'University' },
        { path: '/data/nirf_engineering.csv', category: 'Engineering' },
        { path: '/data/nirf_pharmacy.csv', category: 'Pharmacy' },
        { path: '/data/nirf_Managementy.csv', category: 'Management' },
      ];

      const institutionHistory = [];
      // Track unique year-category combinations to avoid duplicate entries
      const yearCategoryTracker = new Set();
      let state = selectedInst.state || 'Unknown';
      const categories = new Set();

      for (const file of files) {
        const response = await fetch(file.path);
        const csvText = await response.text();
        
        const { data: parsedData } = Papa.parse(csvText, {
          header: true,
          skipEmptyLines: true
        });

        parsedData.forEach(row => {
          let name = row.Name || row.name || '';
          if (typeof name === 'string') {
            name = name.replace(/[\d\(\)\"\']+/g, '').trim();
          }
          
          if (name === selectedInst.name) {
            // Debug: Log the matching row
            console.log(`Found matching institution in ${file.category}:`, row);
            
            // Extract basic data with fallbacks
            const score = parseFloat(row.Score || row.score || 0);
            const rank = parseInt(row.Rank || row.rank || 0);
            const year = parseInt(row.Year || row.year || 2020);
            state = row.State || row.state || state;
            
            // Try different column name patterns for parameters
            const tlr = parseFloat(row.TLR || row.tlr || row.Teaching_Learning_Resources || 0);
            const rpc = parseFloat(row.RPC || row.rpc || row.Research_Professional_Practice || 0);
            const oi = parseFloat(row.OI || row.oi || row.Outreach_Inclusivity || 0);
            const perception = parseFloat(row.Perception || row.perception || row.Peer_Perception || 0);
            
            categories.add(file.category);
            
            // Only add if this year-category combination hasn't been seen before
            const yearCategoryKey = `${year}-${file.category}`;
            if (!yearCategoryTracker.has(yearCategoryKey)) {
              yearCategoryTracker.add(yearCategoryKey);
              
              institutionHistory.push({
                year,
                category: file.category,
                score,
                rank,
                tlr: tlr || 0,
                rpc: rpc || 0,
                oi: oi || 0,
                perception: perception || 0,
                state
              });
            }
          }
        });
      }

      // Debug: Log the collected history
      console.log("Institution history collected:", institutionHistory);

      // Sort by year and organize data
      institutionHistory.sort((a, b) => a.year - b.year);
      
      // Ensure we at least have empty arrays and default values
      const finalHistory = institutionHistory.length > 0 ? institutionHistory : [{
        year: 2020,
        category: 'N/A',
        score: 0,
        rank: 0,
        tlr: 0,
        rpc: 0,
        oi: 0,
        perception: 0,
        state: state
      }];
      
      setInstitutionData({
        history: finalHistory,
        state,
        categories: Array.from(categories).length > 0 ? Array.from(categories) : ['N/A']
      });
      
      setTabValue(0); // Reset to first tab when new institution is selected
      setError('');
    } catch (err) {
      console.error('Error loading institution data:', err);
      setError('Failed to load institution data. Please try again later.');
      setInstitutionData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  const renderOverview = () => {
    if (!institutionData) {
      return (
        <Typography variant="body1" align="center" color="text.secondary">
          No data available for this institution
        </Typography>
      );
    }
    
    const { history, state, categories } = institutionData;
    
    if (!history || history.length === 0) {
      return (
        <Typography variant="body1" align="center" color="text.secondary">
          No history data available for this institution
        </Typography>
      );
    }
    
    // Get latest data
    const latestData = [...history].sort((a, b) => b.year - a.year)[0] || {
      year: new Date().getFullYear(),
      category: 'Unknown',
      score: 0,
      rank: 0
    };
    
    // Get data by category for pie chart
    const categoryData = categories.map(category => {
      const categoryHistory = history.filter(item => item.category === category);
      const latestCategoryData = categoryHistory.length > 0 
        ? [...categoryHistory].sort((a, b) => b.year - a.year)[0]
        : null;
      
      return {
        name: category,
        value: latestCategoryData ? latestCategoryData.score : 0
      };
    });
    
    // Years available
    const years = [...new Set(history.map(item => item.year))].sort((a, b) => a - b);
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {selectedInstitution || 'Institution Profile'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  State: {state || 'Unknown'}
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Categories: 
                  {categories && categories.length > 0 ? 
                    categories.map(category => (
                      <Chip 
                        key={category} 
                        label={category} 
                        color="primary" 
                        size="small" 
                        sx={{ ml: 1 }} 
                      />
                    )) : 
                    <Chip label="N/A" color="default" size="small" sx={{ ml: 1 }} />
                  }
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Latest Rank: {latestData.rank} ({latestData.year}, {latestData.category})
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Latest Score: {latestData.score.toFixed(2)} ({latestData.year}, {latestData.category})
                </Typography>
                <Typography variant="subtitle1" gutterBottom>
                  Years Available: {years.length > 0 ? years.join(", ") : "No data"}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                {categoryData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        innerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                        label={(entry) => entry.name}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toFixed(2)} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">No category data available</Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Score Trends Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip formatter={(value) => value?.toFixed(2) || '0.00'} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#3b82f6" 
                      name="Score" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Rank Trends Over Time
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis reversed />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="rank" 
                      stroke="#10b981" 
                      name="Rank" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderDetailedAnalysis = () => {
    if (!institutionData) {
      return (
        <Typography variant="body1" align="center" color="text.secondary">
          No data available for this institution
        </Typography>
      );
    }
    
    const { history } = institutionData;
    
    if (!history || history.length === 0) {
      return (
        <Typography variant="body1" align="center" color="text.secondary">
          No historical data available for this institution
        </Typography>
      );
    }
    
    // Get latest year
    const latestYear = Math.max(...history.map(item => item.year));
    const historicalData = history.map(item => ({
      ...item,
      year: item.year.toString() // Convert to string for better display
    }));
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Parameter Breakdown by Year
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Year</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>Rank</TableCell>
                      <TableCell>TLR</TableCell>
                      <TableCell>RPC</TableCell>
                      <TableCell>OI</TableCell>
                      <TableCell>Perception</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historicalData.length > 0 ? (
                      historicalData
                        .sort((a, b) => b.year - a.year) // Sort by year descending
                        .map((item, index) => (
                          <TableRow 
                            key={index}
                            sx={{ 
                              backgroundColor: item.year === latestYear.toString() ? 'rgba(25, 118, 210, 0.1)' : 'transparent',
                              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' }
                            }}
                          >
                            <TableCell>{item.year}</TableCell>
                            <TableCell>{item.category}</TableCell>
                            <TableCell>{(item.score || 0).toFixed(2)}</TableCell>
                            <TableCell>{item.rank || 'N/A'}</TableCell>
                            <TableCell>{(item.tlr || 0).toFixed(2)}</TableCell>
                            <TableCell>{(item.rpc || 0).toFixed(2)}</TableCell>
                            <TableCell>{(item.oi || 0).toFixed(2)}</TableCell>
                            <TableCell>{(item.perception || 0).toFixed(2)}</TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align="center">No data available</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Parameter Comparison
              </Typography>
              {historicalData.length > 0 ? (
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historicalData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => (value || 0).toFixed(2)} />
                      <Legend />
                      <Bar dataKey="tlr" name="Teaching & Learning Resources" fill="#8884d8" />
                      <Bar dataKey="rpc" name="Research & Professional Practice" fill="#82ca9d" />
                      <Bar dataKey="oi" name="Outreach & Inclusivity" fill="#ffc658" />
                      <Bar dataKey="perception" name="Perception" fill="#ff8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              ) : (
                <Box sx={{ height: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">No parameter data available</Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  return (
    <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Institution Profile
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Explore detailed performance metrics and trends for individual institutions
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  label="Category"
                >
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={8}>
              <Autocomplete
                options={filteredInstitutions}
                value={filteredInstitutions.find(inst => inst.name === selectedInstitution) || null}
                onChange={handleInstitutionChange}
                getOptionLabel={(option) => option.name}
                loading={loading}
                loadingText="Loading institutions..."
                noOptionsText={selectedCategory !== 'All' ? 
                  `No institutions found in ${selectedCategory} category` : 
                  "No institutions found"}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Box>
                      <Typography variant="body1">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.state} | {option.categories.join(', ')}
                      </Typography>
                    </Box>
                  </Box>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search for an institution"
                    variant="outlined"
                    fullWidth
                    helperText={filteredInstitutions.length === 0 ? 
                      "No institutions available for selected category" : 
                      (filteredInstitutions.length !== institutions.length ? 
                        `Showing ${filteredInstitutions.length} institutions in ${selectedCategory}` : 
                        "Start typing to search")}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {loading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />
            </Grid>
            {selectedCategory !== 'All' && (
              <Grid item xs={12}>
                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center' }}>
                  <Button 
                    variant="outlined" 
                    color="primary" 
                    size="small" 
                    onClick={() => setSelectedCategory('All')}
                  >
                    Clear Filter
                  </Button>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

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

        {!loading && !error && selectedInstitution && (
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                <Tab label="Overview" />
                <Tab label="Detailed Analysis" />
              </Tabs>
            </Box>
            
            <TabPanel value={tabValue} index={0}>
              {renderOverview()}
            </TabPanel>
            
            <TabPanel value={tabValue} index={1}>
              {renderDetailedAnalysis()}
            </TabPanel>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default InstitutionProfile; 