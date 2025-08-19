import React, { useEffect, useState } from "react";
import "../styles/TeacherDashboard.css";
import Sidebar from "./Sidebar";
import { supabase } from "../utils/supabaseClient";
import defaultProfile from "/public/default_profile.png";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [teacherData, setTeacherData] = useState(null);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const daysInMonth = Array.from(
    { length: new Date(currentYear, currentMonth + 1, 0).getDate() },
    (_, i) => i + 1
  );

  useEffect(() => {
    if (!user) return;

    const fetchTeacherInfo = async () => {
      setTeacherData(null); // Reset teacher data before fetching
      const { data, error } = await supabase
        .from("users")
        .select("id, first_name, last_name, profile_picture")
        .eq("id", user.id)
        .eq("role", "Teacher")
        .single();

      if (error) {
        console.error("Error fetching teacher data:", error.message);
        // TeacherData remains null due to reset above
        return;
      }
      if (!data) {
        console.error(`Teacher data not found for user ID: ${user.id}. User might not be a teacher or does not exist.`);
        // TeacherData remains null
      } else {
        setTeacherData(data);
      }
    };

    fetchTeacherInfo();
  }, [user]);

  useEffect(() => {
    if (!teacherData?.id) return;

    const fetchDashboardData = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        // Fetch sections first as other queries might depend on sectionIds
        const { data: initialSections, error: sectionError } = await supabase
          .from("sections")
          .select("id, section_name")
          .eq("teacher_id", teacherData.id)
          .order("section_name", { ascending: true });

        if (sectionError) throw sectionError;
        const fetchedSections = initialSections || [];
        setSections(fetchedSections);

        // --- Always fetch messages ---
        const { data: fetchedMessagesData, error: messagesError } = await supabase
          .from("messages")
          .select(`
            id, content, created_at, "read",
            sender:sender_id (id, first_name)
          `)
          .eq("receiver_id", teacherData.id)
          .eq("read", false) // Fetch only unread messages
          .order("created_at", { ascending: false })
          .limit(5);

        if (messagesError) throw messagesError;
        const currentMessages = fetchedMessagesData || [];
        setMessages(currentMessages);

        // --- Conditionally fetch other data if sections exist ---
        if (fetchedSections.length === 0) {
          setStudents([]);
          setLeaderboard([]); // Ensure leaderboard is cleared if no sections
          setSubmissions([]);
          // setLoading(false); // Moved to finally block
          // return; // Allow flow to continue to process messages for notifications
        }

        const sectionIds = fetchedSections.map((sec) => sec.id);

        // Perform section-dependent fetches concurrently
        const [
          studentsResponse,
          leaderboardResponse,
          submissionsResponse,
        ] = await Promise.all([
          supabase
            .from("users")
            .select("id, first_name, last_name, section_id")
            .in("section_id", sectionIds)
            .eq("role", "Student"),
          supabase
            .from("leaderboard")
            .select("id, user_id, score, section_id")
            .in("section_id", sectionIds)
            .order("score", { ascending: false }),
          supabase
            .from("submissions")
            .select(`
              id, 
              student_id, 
              section_id, 
              submitted_at, 
              status,
              assessment:assessments (title) 
            `)
            .in("section_id", sectionIds)
            .order("submitted_at", { ascending: false })
            .limit(5),
        ]);

        // Destructure results and handle errors
        const { data: fetchedStudentsData, error: studentError } = studentsResponse;
        if (studentError) throw studentError;
        const currentStudents = fetchedStudentsData || [];
        setStudents(currentStudents);

        const { data: fetchedLeaderboardData, error: leaderboardError } = leaderboardResponse;
        if (leaderboardError) throw leaderboardError;
        setLeaderboard(fetchedLeaderboardData || []);


        const { data: fetchedSubmissionsData, error: submissionsError } = submissionsResponse;
        if (submissionsError) throw submissionsError;
        const currentSubmissions = fetchedSubmissionsData || [];
        setSubmissions(currentSubmissions);

        // Process notifications
        // Combine messages (always fetched) with reminders and submissions (conditionally fetched)
        const notifList = [];

        // Add messages (currentMessages is populated from the fetch before the section check)
        currentMessages.forEach((msg) => {
          if (!msg.read && msg.sender) {
            notifList.push({
              type: "message",
              id: `msg-${msg.id}`, // Use a unique ID
              title: `New message from ${msg.sender.first_name}`,
              description: null, // Messages don't have description in this format
              due_date: msg.created_at,
              related_id: msg.sender.id, // Link to sender for chat
            });
          }
        });

        // Add reminders (only if sections were fetched)
        // Need to fetch reminders separately now, as they were removed from Promise.all
        if (fetchedSections.length > 0) {
           const { data: fetchedRemindersData, error: remindersError } = await supabase
             .from("reminders")
             .select("id, title, description, due_date, section_id")
             .in("section_id", sectionIds)
             .order("due_date", { ascending: true });

           if (remindersError) throw remindersError;
           const allReminders = fetchedRemindersData || [];

           const upcomingReminders = allReminders.filter(reminder => {
          return new Date(reminder.due_date) >= new Date();
           });

        upcomingReminders.forEach((reminder) => {
          notifList.push({
            type: "reminder",
            id: `rem-${reminder.id}`, // Add unique ID for reminder notification
            title: `Deadline: ${reminder.title}`,
            description: reminder.description,
            due_date: reminder.due_date,
            related_id: reminder.id,
          });
        });
        }

        currentSubmissions.forEach((submission) => {
          const assignmentTitle = submission.assessment?.title || "Unknown Assignment";
          const studentIdentifier = currentStudents.find(s => s.id === submission.student_id);
          notifList.push({
            type: "submission",
            id: `sub-${submission.id}`, // Add unique ID for submission notification
            title: `New Submission: ${assignmentTitle}`,
            description: `From: ${studentIdentifier ? `${studentIdentifier.first_name} ${studentIdentifier.last_name}` : `Student ID: ${submission.student_id}`}`,
            due_date: submission.submitted_at,
            related_id: submission.id,
          });
        });


        notifList.sort((a, b) => new Date(b.due_date || 0) - new Date(a.due_date || 0));
        setNotifications(notifList);
      } catch (error) {
        console.error("Error fetching dashboard data:", error.message);
        // Clear all relevant states on error
        setSections([]);
        setMessages([]);
        setStudents([]);
        setLeaderboard([]);
        setSubmissions([]);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [teacherData]);

  const handleProfileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !teacherData?.id) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64ProfilePic = reader.result;

      const { error } = await supabase
        .from("users")
        .update({ profile_picture: base64ProfilePic })
        .eq("id", teacherData.id);

      if (error) {
        console.error("Error updating profile picture:", error.message);
      } else {
        setTeacherData((prev) => ({
          ...prev,
          profile_picture: base64ProfilePic,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  const fullName = teacherData
    ? `${teacherData.first_name} ${teacherData.last_name}`
    : "Teacher";

  const handleNotificationClick = (notification) => {
    if (notification.type === 'message' && notification.related_id) {
      navigate(`/messages/chat/${notification.related_id}`);
    } else if (notification.type === 'submission' && notification.related_id) {
      // Example: Navigate to a submission detail page if you have one
      // navigate(`/submissions/${notification.related_id}`);
      console.log("Clicked submission notification, ID:", notification.related_id);
    } else if (notification.type === 'reminder' && notification.related_id) {
      // Example: Navigate to a page showing reminder details
      // navigate(`/reminders/${notification.related_id}`);
      console.log("Clicked reminder notification, ID:", notification.related_id);
    }
  };
  return (
    <>
      <Sidebar />
      <div className="dashboard-container fade-in">
        <main className="main-content">
          <header className="dashboard-header slide-down">
            <div className="dashboard-title">
              <h1><span className="highlight">Dashboard</span></h1>
            </div>
            <div className="search-profile">
              <input type="text" placeholder="Search..." className="search-bar" />
              <div className="profile">
                <label htmlFor="profile-upload" className="profile-pic">
                  <img
                    className="profile-pic"
                    src={teacherData?.profile_picture || defaultProfile}
                    alt="Profile"
                    onError={(e) => (e.target.src = defaultProfile)}
                  />
                </label>
                <input
                  type="file"
                  id="profile-upload"
                  accept="image/*"
                  onChange={handleProfileChange}
                  style={{ display: "none" }}
                />
                <p className="profile-name">{fullName}</p>
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
                  leaderboard.slice(0, 5).map((entry, index) => {
                    const student = students.find((s) => s.id === entry.user_id);
                    return (
                      <div className="entry" key={entry.id}>
                        {student ? `${student.first_name} ${student.last_name}` : "Unknown"} - {entry.score}
                      </div>
                    );
                  })
                ) : (
                  <div className="entry">No leaderboard data found.</div>
                )}
              </div>

              <div className="card yellow notification-card fade-in-up">
                <div className="green-title">Notifications</div>
                {notifications.length > 0 ? (
                  notifications.map((notif, index) => (
                    <div 
                      className="entry clickable-notification" 
                      key={notif.id || index}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <strong>{notif.title}</strong>
                      {notif.type === 'message' && notif.due_date && (
                        <div className="notification-timestamp-message">
                          {new Date(notif.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </div>
                      )}
                      {notif.type !== 'message' && notif.due_date && (
                        <span className="notification-date">
                          {' - '}{new Date(notif.due_date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true })}
                        </span>
                      )}
                      {notif.type !== 'message' && notif.description && (
                        <p>{notif.description}</p>
                      )}
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
                    <div className="entry clickable-notification" 
                    key={sec.id}
                    onClick={() => navigate(`/manage-section/${sec.section_name}`)}
                    >{sec.section_name}
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
                    <div key={day} className="day">{day}</div>
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
