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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function Explore() {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [selectedCategory, setSelectedCategory] = useState('University');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load and process data based on selected category
    const loadData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/data/nirf_${selectedCategory.toLowerCase()}.csv`);
        const csvData = await response.text();
        const processedData = processCSVData(csvData);
        setData(processedData);
      } catch (error) {
        console.error('Error loading data:', error);
      }
      setLoading(false);
    };

    loadData();
  }, [selectedCategory]);

  const filteredData = data.filter(item => item.Year === selectedYear);
  const topInstitutions = getTopNInstitutions(filteredData, 10);

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Explore NIRF Rankings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Year</InputLabel>
              <Select
                value={selectedYear}
                label="Year"
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {Array.from({ length: 9 }, (_, i) => 2016 + i).map(year => (
                  <MenuItem key={year} value={year.toString()}>
                    {year}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
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
          </Paper>
        </Grid>

        <Grid item xs={12} md={9}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Top 10 Institutions ({selectedYear})
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Rank</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>City</TableCell>
                    <TableCell>State</TableCell>
                    <TableCell>Score</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {topInstitutions.map((institution) => (
                    <TableRow key={institution.Institute_ID}>
                      <TableCell>{institution.Rank}</TableCell>
                      <TableCell>{institution.Name}</TableCell>
                      <TableCell>{institution.City}</TableCell>
                      <TableCell>{institution.State}</TableCell>
                      <TableCell>{institution.Score}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Score Distribution
            </Typography>
            <BarChart
              width={800}
              height={300}
              data={topInstitutions}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Score" fill="#8884d8" />
            </BarChart>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Explore; 