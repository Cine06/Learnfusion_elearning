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
import LessonDetails from "./components/LessonDetails";
import PrivateRoute from "./components/PrivateRoute";
import { AuthProvider } from "./context/AuthContext";
import DetailedChatView from "./components/DetailedChatView";


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route
            path="/teacher-dashboard"
            element={
              <PrivateRoute>
                <TeacherDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/assessment"
            element={
              <PrivateRoute>
                <Assessment />
              </PrivateRoute>
            }
          />
          <Route
            path="/handouts"
            element={
              <PrivateRoute>
                <Handouts />
              </PrivateRoute>
            }
          />
          <Route
            path="/section"
            element={
              <PrivateRoute>
                <SectionManagement />
              </PrivateRoute>
            }
          />
          <Route
            path="/manage-section/:sectionName"
            element={
              <PrivateRoute>
                <ManageSection />
              </PrivateRoute>
            }
          />
          <Route
            path="/assign-students/:sectionName"
            element={
              <PrivateRoute>
                <AssignStudents />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <PrivateRoute>
                <Message />
              </PrivateRoute>
            }
          />
          <Route
            path="/report/:sectionName/:lessonName"
            element={
              <PrivateRoute>
                <Report />
              </PrivateRoute>
            }
          />
          <Route
            path="/lesson/:id"
            element={
              <PrivateRoute>
                <LessonDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/messages/chat/:otherUserId"
            element={
              <PrivateRoute>
                <DetailedChatView />
              </PrivateRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
