import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import TeacherDashboard from "./components/TeacherDashboard";
import Assessment from "./components/Assessment";
import Handouts from "./components/Handouts";
import SectionManagement from "./components/SectionManagement";
import ManageSection from "./components/ManageSection";
import AssignStudents from "./components/AssignStudents";
import Message from "./components/Messages";
import Report from "./components/Report";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
        <Route path="/assessment" element={<Assessment />} />
        <Route path="/handouts" element={<Handouts />} />
        <Route path="/section" element={<SectionManagement />} />
        <Route path="/manage-section/:sectionName" element={<ManageSection />} />
        <Route path="/assign-students/:sectionName" element={<AssignStudents />} />
        <Route path="/messages" element={<Message />} />
        <Route path="/report/:sectionName/:lessonName" element={<Report />} />
      </Routes>
    </Router>
  );
}

export default App;