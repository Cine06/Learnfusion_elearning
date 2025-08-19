import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from "./components/AdminDashboard";
import AddUser from "./components/AddUser";
import SectionManagement from "./components/SectionManagement";
import StudentAccounts from "./components/StudentAccounts";
import PrivateRoute from "./routes/PrivateRoute"; 
import TeacherAccounts from "./components/TeacherAccounts";
import ManageSection from "./components/ManageSection";
import TeacherDashboard from "./components/TeacherDashboard";
import Unauthorized from "./components/Unauthorized"; 


function App() {
  return (
    <Router>
      <Routes>
        {/* Changed default route to AdminDashboard */}
        <Route path="/" element={<PrivateRoute requiredRole="Admin"><AdminDashboard /></PrivateRoute>} />
        <Route path="/admin-dashboard" element={<PrivateRoute requiredRole="Admin"><AdminDashboard /></PrivateRoute> }/>
        <Route path="/teacher-dashboard"element={<PrivateRoute requiredRole="Teacher"><TeacherDashboard /></PrivateRoute>}/>
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/add-user" element={<AddUser />} />
        <Route path="/sectionmanage" element={<SectionManagement />} />
        <Route path="/studentaccount" element={<StudentAccounts />} />
        <Route path="/teacheraccount" element={<TeacherAccounts />} />
        <Route path="/manage-section/:sectionName" element={<ManageSection />} />
      </Routes>
    </Router>
  );
}

export default App;