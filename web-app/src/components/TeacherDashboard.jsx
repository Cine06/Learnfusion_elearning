import React, { useEffect, useState } from "react";
import "../styles/TeacherDashboard.css";
import Sidebar from "./Sidebar";
import { supabase } from "../utils/supabaseClient";
import defaultProfile from "/public/default_profile.png";

const TeacherDashboard = () => {
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState("Teacher");
  const [profilePic, setProfilePic] = useState(defaultProfile);
  const [teacherId, setTeacherId] = useState(null);

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = Array.from(
    { length: new Date(currentYear, currentMonth + 1, 0).getDate() },
    (_, i) => i + 1
  );

  useEffect(() => {
    const storedTeacherId = localStorage.getItem("TeacherId");
    const storedTeacherName = localStorage.getItem("TeacherName");
    const storedProfilePic = localStorage.getItem("teacherProfilePic");

    if (storedTeacherId) {
      setTeacherId(storedTeacherId);
      setTeacherName(storedTeacherName || "Teacher");
      setProfilePic(storedProfilePic || defaultProfile);
    } else {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser.role === "Teacher") {
        setTeacherId(storedUser.id);
        setTeacherName(`${storedUser.first_name} ${storedUser.last_name}`);
        setProfilePic(storedUser.profile_picture || defaultProfile);
      }
    }
  }, []); 

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (!teacherId) return;

      const { data: fetchedSections, error: sectionError } = await supabase
        .from("sections")
        .select("id, section_name")
        .eq("teacher_id", teacherId);

      if (sectionError) {
        console.error("Error fetching sections:", sectionError);
      } else {
        setSections(fetchedSections || []);
      }

      if (fetchedSections?.length > 0) {
        const sectionIds = fetchedSections.map((sec) => sec.id);
        const { data: fetchedStudents, error: studentError } = await supabase
          .from("users")
          .select("id, first_name, last_name, section_id")
          .in("section_id", sectionIds)
          .eq("role", "Student");

        if (studentError) {
          console.error("Error fetching students:", studentError);
        } else {
          setStudents(fetchedStudents || []);
        }
        const { data: fetchedLeaderboard, error: leaderboardError } = await supabase
          .from("leaderboard")
          .select("user_id, score, section_id")
          .in("section_id", sectionIds)
          .order("score", { ascending: false });

        if (leaderboardError) {
          console.error("Error fetching leaderboard:", leaderboardError);
        } else {
          setLeaderboard(fetchedLeaderboard || []);
        }
        const { data: fetchedNotifications, error: notificationError } = await supabase
          .from("reminders")
          .select("title, description, due_date")
          .eq("created_by", teacherId)
          .order("due_date", { ascending: true });

        if (notificationError) {
          console.error("Error fetching notifications:", notificationError);
        } else {
          setNotifications(fetchedNotifications || []);
        }
      }

      setLoading(false);
    };

    fetchTeacherData();
  }, [teacherId]); 

  const handleProfileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64ProfilePic = reader.result;
        setProfilePic(base64ProfilePic);

        const { error } = await supabase
          .from("users")
          .update({ profile_picture: base64ProfilePic })
          .eq("id", teacherId);

        if (error) {
          console.error("Error updating profile picture:", error.message);
        } else {
          localStorage.setItem("teacherProfilePic", base64ProfilePic);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Sidebar />
      <div className="dashboard-container fade-in">
        <main className="main-content">
          <header className="dashboard-header slide-down">
            <div className="dashboard-title">
              <h1>
                <span className="highlight">Dashboard</span>
              </h1>
            </div>
            <div className="search-profile">
              <input type="text" placeholder="Search..." className="search-bar" />
              <div className="profile">
                <label htmlFor="profile-upload" className="profile-pic">
                  <img 
                    className="profile-pic" 
                    src={profilePic} 
                    alt="Profile"
                    onError={(e) => { e.target.src = defaultProfile; }} 
                  />
                </label>
                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  onChange={handleProfileChange}
                  style={{ display: "none" }}
                />
                <p className="profile-name">{teacherName}</p>
              </div>
            </div>
          </header>

          {loading ? (
            <p className="loading-message">Loading dashboard...</p>
          ) : (
            <div className="dashboard-grid">
              <div className="card yellow leaderboard-card fade-in-up">
                <div className="green-title">Leaderboard</div>
                {leaderboard.length > 0 ? (
                  leaderboard.slice(0, 5).map((entry, index) => (
                    <div className="entry" key={index}>
                      {students.find(student => student.id === entry.user_id)?.first_name} {students.find(student => student.id === entry.user_id)?.last_name} - {entry.score}
                    </div>
                  ))
                ) : (
                  <div className="entry">No leaderboard data found.</div>
                )}
              </div>

              <div className="card yellow notification-card fade-in-up">
                <div className="green-title">Notifications</div>
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div className="entry" key={index}>
                      <strong>{notif.title}</strong> - {notif.due_date}
                      <p>{notif.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="entry">No new notifications.</div>
                )}
              </div>

              <div className="card yellow section-card fade-in-up">
                <div className="green-title">Sections</div>
                {sections.length > 0 ? (
                  sections.map((sec) => (
                    <div className="entry" key={sec.id}>
                      {sec.section_name}
                    </div>
                  ))
                ) : (
                  <div className="entry">No assigned sections.</div>
                )}
              </div>

              <div className="card yellow schedule-card fade-in-up">
                <div className="green-title">Schedule</div>
                <div className="todo-title">To-do List</div>
                <div className="month">
                  {new Date(currentYear, currentMonth).toLocaleString("default", {
                    month: "long",
                  })}
                </div>
                <div className="calendar">
                  {daysInMonth.map((day) => (
                    <div key={day} className="day">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default TeacherDashboard;
