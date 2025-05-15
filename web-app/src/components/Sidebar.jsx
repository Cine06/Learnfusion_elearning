import React, { useEffect, useState } from "react";
import "../styles/Sidebar.css";
import { NavLink, useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

const Sidebar = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/"); 
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("email", user.email)
          .single();

        if (error) {
          console.error("Error fetching user data:", error);
        } else {
          setUserData(data);
        }
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="sidebar-container">
      <div className="sidebar">
        <div className="sidebar-logo">
          <img src="/logo.png" alt="LearnFusion Logo" />
          <h2><span className="highlight">Learn</span>Fusion</h2>
        </div>

        {userData && (
          <div className="sidebar-user-info">
            <img
              src={userData.profile_picture || "/default-avatar.png"}
              alt="Profile"
              className="sidebar-avatar"
            />
            <p>{`${userData.first_name} ${userData.last_name}`}</p>
            <p className="role">{userData.role}</p>
          </div>
        )}

        <ul className="sidebar-nav">
          <li>
            <NavLink to="/teacher-dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
              Dashboard
            </NavLink>
          </li>
          <li>
            <NavLink to="/assessment" className={({ isActive }) => (isActive ? "active" : "")}>
              Assessment
            </NavLink>
          </li>
          <li>
            <NavLink to="/handouts" className={({ isActive }) => (isActive ? "active" : "")}>
              Handouts
            </NavLink>
          </li>
          <li>
            <NavLink to="/section" className={({ isActive }) => (isActive ? "active" : "")}>
              Section
            </NavLink>
          </li>
          <li>
            <NavLink to="/messages" className={({ isActive }) => (isActive ? "active" : "")}>
              Messages
            </NavLink>
          </li>
          <li>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
