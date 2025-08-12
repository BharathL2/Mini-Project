import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  BarChart as ChartIcon,
  Analytics as AnalyticsIcon,
  School as SchoolIcon,
  Lightbulb as LightbulbIcon,
  Compare as CompareIcon,
} from '@mui/icons-material';

const navItems = [
  { name: 'HOME', path: '/', icon: <HomeIcon /> },
  { name: 'EXPLORE RANKINGS', path: '/explore-rankings', icon: <ChartIcon /> },
  { name: 'ANALYSIS HUB', path: '/analysis-hub', icon: <AnalyticsIcon /> },
  { name: 'INSTITUTION PROFILES', path: '/institution-profiles', icon: <SchoolIcon /> },
  { name: 'INSIGHTS', path: '/insights', icon: <LightbulbIcon /> },
];

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Box sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6" component="div">
          NIRF Insights
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem key={item.name} component={RouterLink} to={item.path} sx={{ color: 'inherit', textDecoration: 'none' }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
        <ListItem 
          component={RouterLink} 
          to="/compare-institutions" 
          sx={{ 
            color: 'white', 
            bgcolor: 'primary.main', 
            '&:hover': { bgcolor: 'primary.dark' },
            borderRadius: 1,
            mt: 2,
            mx: 2
          }}
        >
          <ListItemIcon sx={{ color: 'white' }}>
            <CompareIcon />
          </ListItemIcon>
          <ListItemText primary="COMPARE INSTITUTIONS" />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="static" color="default" elevation={1} sx={{ bgcolor: 'white' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo and Title */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography
                variant="h6"
                component={RouterLink}
                to="/"
                sx={{
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                NIRF Insights
              </Typography>
            </Box>

            {/* Mobile Menu Button */}
            {isMobile ? (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            ) : (
              /* Desktop Navigation */
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {navItems.map((item) => (
                  <Button
                    key={item.name}
                    component={RouterLink}
                    to={item.path}
                    sx={{ 
                      color: 'text.primary',
                      '&:hover': { 
                        bgcolor: 'rgba(0,0,0,0.04)', 
                        borderBottom: '2px solid',
                        borderColor: 'primary.main'
                      },
                      mx: 1,
                      py: 2
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
                <Button
                  variant="contained"
                  color="primary"
                  component={RouterLink}
                  to="/compare-institutions"
                  startIcon={<CompareIcon />}
                  sx={{ ml: 2 }}
                >
                  COMPARE INSTITUTIONS
                </Button>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Navigation Drawer */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            '& .MuiDrawer-paper': { width: 280 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
}

export default Navbar; 