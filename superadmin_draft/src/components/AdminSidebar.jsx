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
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser && storedUser.role === "Admin") {
      setAdminId(storedUser.id);
      setAdminName(`${storedUser.first_name} ${storedUser.last_name}`);
      setProfilePic(storedUser.profile_picture || defaultProfile);
      // Optionally, fetch fresh details if profile_picture might be stale
      // fetchAdminDetails(storedUser.id, storedUser.profile_picture);
    } else {
      // Handle case where user is not found or not an admin, e.g., navigate to login
      navigate("/");
    }
  }, [navigate]);

  // This function can be used if you need to refresh details not stored in localStorage's user object
  // or if the localStorage user object might be stale.
  // const fetchAdminDetails = async (currentAdminId, currentProfilePic) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from("users")
  //       .select("first_name, last_name, profile_picture")
  //       .eq("id", currentAdminId)
  //       .single();
  //     if (error) throw error;
  //     setAdminName(`${data.first_name} ${data.last_name}`);
  //     setProfilePic(data.profile_picture || defaultProfile);
  //   } catch (error) {
  //     console.error("Error fetching admin details:", error.message);
  //     // Fallback to localStorage if fetch fails but user is authenticated
  //     setProfilePic(currentProfilePic || defaultProfile);
  //   }
  // };

  const handleProfileChange = async (event) => {
    const file = event.target.files[0];
    if (!file || !adminId) return;

    try {
      const filePath = `avatars/${adminId}/${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures") // Ensure this bucket exists and has appropriate policies
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true, // Overwrite if file already exists
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("profile-pictures").getPublicUrl(filePath);
      const publicURL = urlData.publicUrl;

      const { error: dbError } = await supabase
        .from("users")
        .update({ profile_picture: publicURL })
        .eq("id", adminId)
        .select()
        .single();

      if (dbError) throw dbError;

      setProfilePic(publicURL);
      // Update localStorage user object if necessary
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser && storedUser.id === adminId) {
        storedUser.profile_picture = publicURL;
        localStorage.setItem("user", JSON.stringify(storedUser));
      }
    } catch (error) {
      console.error("Error updating profile picture:", error.message);
      alert("Failed to update profile picture.");
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
