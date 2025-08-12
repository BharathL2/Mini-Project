
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ExploreRankings from './pages/ExploreRankings';
import AnalysisHub from './pages/AnalysisHub';
import Insights from './pages/Insights';
import CompareInstitutions from './pages/CompareInstitutions';
import InstitutionProfile from './pages/InstitutionProfile';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/explore-rankings" element={<ExploreRankings />} />
        <Route path="/analysis-hub" element={<AnalysisHub />} />
        <Route path="/institution-profiles" element={<InstitutionProfile />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/compare-institutions" element={<CompareInstitutions />} />
      </Routes>
    </>
  );
}

export default App; 
