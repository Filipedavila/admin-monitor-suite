import { Routes, Route, BrowserRouter } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';


function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />} />
    </Routes>
  );
}

export default App;