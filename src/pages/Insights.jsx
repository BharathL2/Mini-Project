import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardMedia,
  Divider,
} from '@mui/material';
import {
  Timeline as TimelineIcon,
  Category as CategoryIcon,
  BarChart as ChartIcon,
  TrendingUp as TrendingUpIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
} from '@mui/icons-material';

function Insights() {
  const insights = [
    {
      title: "Regional Disparity in Top Rankings",
      icon: <LocationIcon fontSize="large" color="primary" />,
      content: "Southern states (Karnataka, Tamil Nadu) and Delhi dominate the top rankings across categories. Karnataka alone accounts for over 20% of top-ranked institutions, highlighting a significant geographic concentration of educational excellence.",
    },
    {
      title: "Parameter-Specific Excellence",
      icon: <ChartIcon fontSize="large" color="primary" />,
      content: "Engineering institutions consistently score higher in Research and Professional Practice (RPC), while Universities excel in Teaching, Learning & Resources (TLR) and Graduation Outcomes (GO). This suggests category-specific strengths across different parameters.",
    },
    {
      title: "Year-over-Year Performance Trends",
      icon: <TrendingUpIcon fontSize="large" color="primary" />,
      content: "Average scores across all categories have shown a steady increase of approximately 1-2 points annually since 2016, indicating gradual quality improvements in Indian higher education institutions.",
    },
    {
      title: "Category Growth Analysis",
      icon: <CategoryIcon fontSize="large" color="primary" />,
      content: "The Engineering category has seen the largest growth in participating institutions (15% increase since 2016), followed by Management programs (12%). This reflects the expanding technical education landscape in India.",
    },
    {
      title: "Perception vs. Performance Gap",
      icon: <TimelineIcon fontSize="large" color="primary" />,
      content: "Established institutions often score higher on Perception than newer institutions with similar objective metrics, suggesting a reputation lag where perception takes time to catch up with actual performance improvements.",
    },
    {
      title: "Institutional Consistency",
      icon: <SchoolIcon fontSize="large" color="primary" />,
      content: "Top 10 institutions in each category show remarkable consistency, with over 80% maintaining their top 10 status year-over-year. This indicates a stable upper tier of institutions that maintain quality standards reliably.",
    },
  ];

  const keyStats = [
    { label: "Years of Data", value: "9" },
    { label: "Categories", value: "4" },
    { label: "Institutions", value: "400+" },
    { label: "Parameters", value: "5" },
  ];

  return (
    <Box sx={{ py: 4, bgcolor: 'grey.50', minHeight: '100vh' }}>
      <Container maxWidth="lg">
        <Typography variant="h4" component="h1" gutterBottom align="center">
          NIRF Insights
        </Typography>
        <Typography variant="body1" paragraph align="center">
          Data-driven insights into Indian higher education based on NIRF rankings
        </Typography>

        <Paper elevation={2} sx={{ p: 3, mb: 4, bgcolor: '#f8fafc' }}>
          <Typography variant="h5" gutterBottom>
            About the NIRF Framework
          </Typography>
          <Typography variant="body1" paragraph>
            The National Institutional Ranking Framework (NIRF) was approved by the MHRD and launched in 2015. It outlines a methodology to rank institutions across India based on five parameters: Teaching, Learning and Resources (TLR), Research and Professional Practice (RPC), Graduation Outcomes (GO), Outreach and Inclusivity (OI), and Perception.
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {keyStats.map((stat, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h3" color="primary">
                    {stat.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>

        <Typography variant="h5" gutterBottom>
          Key Insights from NIRF Data
        </Typography>

        <Grid container spacing={3}>
          {insights.map((insight, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ 
                height: '100%',
                transition: 'transform 0.2s',
                '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
              }}>
                <CardContent>
                  <Box sx={{ display: 'flex', mb: 2 }}>
                    <Box sx={{ mr: 2 }}>
                      {insight.icon}
                    </Box>
                    <Typography variant="h6">
                      {insight.title}
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="body1">
                    {insight.content}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Paper elevation={2} sx={{ p: 3, mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Parameter Breakdown
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    TLR
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Teaching, Learning & Resources
                  </Typography>
                  <Typography variant="body2">
                    Focuses on student strength, faculty-student ratio, faculty qualifications, and financial resources.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    RPC
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Research and Professional Practice
                  </Typography>
                  <Typography variant="body2">
                    Measures research publications, quality of publications, IPR and patents, and funded research projects.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    GO
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Graduation Outcomes
                  </Typography>
                  <Typography variant="body2">
                    Evaluates university exam results, median salary, and higher studies and entrepreneurship metrics.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    OI
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Outreach and Inclusivity
                  </Typography>
                  <Typography variant="body2">
                    Assesses diversity (gender, regional, economically disadvantaged) and facilities for physically challenged students.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" gutterBottom>
                    Perception
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Public Perception
                  </Typography>
                  <Typography variant="body2">
                    Based on surveys of employers, academic peers, public perception, and competitiveness of admissions.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
}

export default Insights; 