import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import PlatformAccounts from './pages/PlatformAccounts';
import ContentPublish from './pages/ContentPublish';
import ScheduledPublish from './pages/ScheduledPublish';
import DataStatistics from './pages/DataStatistics';
import DependencyManager from './pages/DependencyManager';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/platform-accounts" element={<PlatformAccounts />} />
        <Route path="/content-publish" element={<ContentPublish />} />
        <Route path="/scheduled-publish" element={<ScheduledPublish />} />
        <Route path="/data-statistics" element={<DataStatistics />} />
        <Route path="/dependency-manager" element={<DependencyManager />} />
        {/* 其他路由可以在这里添加 */}
      </Routes>
    </Router>
  )
}

export default App
