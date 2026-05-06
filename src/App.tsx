import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { 
  Home, 
  ActivityForecast, 
  ActivityReviewPage, 
  ActivityLedger, 
  ActivityStatistics, 
  Education, 
  Settings 
} from "@/pages";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/activity/forecast" element={<ActivityForecast />} />
        <Route path="/activity/review" element={<ActivityReviewPage />} />
        <Route path="/activity/ledger" element={<ActivityLedger />} />
        <Route path="/activity/statistics" element={<ActivityStatistics />} />
        <Route path="/education" element={<Education />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Router>
  );
}
