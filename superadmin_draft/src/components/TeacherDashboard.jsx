import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Admin_style.css"; 

const TeacherDashboard = () => {
  const [teacher, setTeacher] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setTeacher(user);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  if (!teacher) return <p>Loading...</p>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Welcome, {teacher.first_name} 👋</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="dashboard-card" onClick={() => navigate("/manage-section")}>
          <h3>My Sections</h3>
          <p>View and manage your assigned sections.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/student-performance")}>
          <h3>Student Performance</h3>
          <p>Track the progress of your students.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/lessons")}>
          <h3>Manage Lessons</h3>
          <p>Create or update lesson content.</p>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/quizzes")}>
          <h3>Quizzes</h3>
          <p>Manage and assign quizzes.</p>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
