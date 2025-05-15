import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "/utils/supabaseClient"; 
import defaultProfile from "/public/default_profile.png";
import "./Admin_style.css";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [adminName, setAdminName] = useState("Admin");
  const [profilePic, setProfilePic] = useState(defaultProfile);
  const [adminId, setAdminId] = useState(null);

  useEffect(() => {
    const storedAdminId = localStorage.getItem("adminId");
    const storedAdminName = localStorage.getItem("adminName");
    const storedProfilePic = localStorage.getItem("adminProfilePic");

    if (storedAdminId) {
      setAdminId(storedAdminId);
      setAdminName(storedAdminName || "Admin");
      setProfilePic(storedProfilePic || defaultProfile);
    } else {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser.role === "Admin") {
        setAdminId(storedUser.id);
        setAdminName(`${storedUser.first_name} ${storedUser.last_name}`);
        setProfilePic(storedUser.profile_picture || defaultProfile);
      }
    }
  }, []);

  const fetchAdminDetails = async (adminId) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("first_name, last_name, profile_picture")
        .eq("id", adminId)
        .single();

      if (error) throw error;

      setAdminName(`${data.first_name} ${data.last_name}`);
      setProfilePic(data.profile_picture || defaultProfile);

      localStorage.setItem("adminName", `${data.first_name} ${data.last_name}`);
      localStorage.setItem("adminProfilePic", data.profile_picture || "");
    } catch (error) {
      console.error("Error fetching admin details:", error.message);
    }
  };

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
          .eq("id", adminId);

        if (error) {
          console.error("Error updating profile picture:", error.message);
        } else {
          localStorage.setItem("adminProfilePic", base64ProfilePic);
        }
      };
      reader.readAsDataURL(file); 
    }
  };

  return (
    <aside className="sidebar">
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
        <p className="profile-name">{adminName}</p>
      </div>

      <nav className="menu">
        <button className="menu-item" onClick={() => navigate("/admin-dashboard")}>
          Accounts
        </button>
        <button className="menu-item" onClick={() => navigate("/sectionmanage")}>
          Section Management
        </button>
        <button className="menu-item" onClick={() => navigate("/studentaccount")}>
          Students Accounts
        </button>
        <button className="menu-item" onClick={() => navigate("/teacheraccount")}>
          Teacher Accounts
        </button>
        <button className="logout-btn" onClick={() => navigate("/")}>
          Logout
        </button>
      </nav>
    </aside>
  );
};

export default AdminSidebar;
