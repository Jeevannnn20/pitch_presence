import { Navigate, Route, Routes } from 'react-router-dom'
import RecordPage from './pages/RecordPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import HistoryPage from './pages/HistoryPage.jsx'
import LoginPage from './pages/LoginPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/record" replace />} />
      <Route path="/record" element={<RecordPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/history" element={<HistoryPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="*" element={<Navigate to="/record" replace />} />
    </Routes>
  )
}
