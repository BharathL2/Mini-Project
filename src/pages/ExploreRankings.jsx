import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
} from '@mui/material';
import Papa from 'papaparse';

function ExploreRankings() {
  const [loading, setLoading] = useState(true);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        // Define files
        const files = [
          { name: 'University', path: '/data/nirf_University.csv' },
          { name: 'Engineering', path: '/data/nirf_engineering.csv' },
          { name: 'Pharmacy', path: '/data/nirf_pharmacy.csv' },
          { name: 'Management', path: '/data/nirf_Managementy.csv' },
        ];

        // Load and parse all files
        const allData = await Promise.all(
          files.map(async (file) => {
            const response = await fetch(file.path);
            const csvText = await response.text();
            const { data } = Papa.parse(csvText, { header: true });
            return { category: file.name, data };
          })
        );

        // Get unique years and combine data
        const allInstitutions = [];
        const yearSet = new Set();

        allData.forEach(categoryData => {
          categoryData.data.forEach(record => {
            if (record.Year) {
              yearSet.add(record.Year);
            }
            if (record.Name) {
              allInstitutions.push({
                ...record,
                category: categoryData.category
              });
            }
          });
        });

        const sortedYears = Array.from(yearSet).sort((a, b) => b - a);
        
        setYears(sortedYears);
        setSelectedYear(sortedYears[0] || '');
        setCategories(files.map(file => file.name));
        setInstitutions(allInstitutions);
        
        // Set initial filtered institutions based on most recent year
        if (sortedYears.length > 0) {
          filterInstitutions(allInstitutions, sortedYears[0], '', '');
        }
      } catch (err) {
        setError('Error loading data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Filter institutions whenever filters change
  useEffect(() => {
    filterInstitutions(institutions, selectedYear, selectedCategory, searchTerm);
  }, [selectedYear, selectedCategory, searchTerm]);

  const filterInstitutions = (allInstitutions, year, category, search) => {
    const filtered = allInstitutions.filter(inst => {
      // Filter by year
      const yearMatch = !year || inst.Year === year;
      
      // Filter by category
      const categoryMatch = !category || inst.category === category;
      
      // Filter by search term
      const searchLower = search.toLowerCase();
      const searchMatch = !search || 
        inst.Name?.toLowerCase().includes(searchLower) || 
        inst.State?.toLowerCase().includes(searchLower);
      
      return yearMatch && categoryMatch && searchMatch;
    });
    
    setFilteredInstitutions(filtered);
    setPage(0); // Reset to first page when filters change
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Explore NIRF Rankings
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Filter and browse institutions by year and category
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <>
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
                  <TextField
                    fullWidth
                    label="Search Institutions"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    variant="outlined"
                  />
                </Grid>
              </Grid>
            </Paper>

            <Paper elevation={2} sx={{ width: '100%', overflow: 'hidden' }}>
              <TableContainer>
                <Table stickyHeader aria-label="institutions table">
                  <TableHead>
                    <TableRow>
                      <TableCell>Rank</TableCell>
                      <TableCell>Institution</TableCell>
                      <TableCell>Category</TableCell>
                      <TableCell>State</TableCell>
                      <TableCell>Score</TableCell>
                      <TableCell>TLR</TableCell>
                      <TableCell>RPC</TableCell>
                      <TableCell>GO</TableCell>
                      <TableCell>OI</TableCell>
                      <TableCell>Perception</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredInstitutions
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((institution, index) => (
                        <TableRow key={index} hover>
                          <TableCell>{institution.Rank}</TableCell>
                          <TableCell>{institution.Name}</TableCell>
                          <TableCell>{institution.category}</TableCell>
                          <TableCell>{institution.State}</TableCell>
                          <TableCell>{parseFloat(institution.Score).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(institution.TLR || 0).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(institution.RPC || 0).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(institution.GO || 0).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(institution.OI || 0).toFixed(2)}</TableCell>
                          <TableCell>{parseFloat(institution.Perception || 0).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[10, 25, 50, 100]}
                component="div"
                count={filteredInstitutions.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
}

export default ExploreRankings; 