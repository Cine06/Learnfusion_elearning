import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { supabase } from "/utils/supabaseClient";
import "./Admin_style.css";

const TeacherAccounts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedTeacher, setUpdatedTeacher] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    const { data, error } = await supabase.from("users").select("*").eq("role", "Teacher");
    if (error) {
      console.error("Error fetching teachers:", error.message);
    } else {
      setTeachers(data);
      setFilteredTeachers(data);
    }
  };

  const handleSearch = () => {
    const filtered = teachers.filter((teacher) =>
      teacher.school_id.toString().includes(searchTerm.trim()) ||
      teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.middle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTeachers(filtered);
  };

  const handleEditClick = (teacher) => {
    setCurrentTeacher(teacher);
    setUpdatedTeacher({ ...teacher });
    setEditing(false);
    setOverlayVisible(true);
  };

  const handleDeleteClick = async (teacherId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this teacher?");
    if (confirmDelete) {
      const { error } = await supabase.from("users").delete().eq("id", teacherId);
      if (!error) {
        fetchTeachers();
      } else {
        console.error("Error deleting teacher:", error.message);
      }
    }
  };

  const handleSaveChanges = async () => {
    const { error } = await supabase.from("users").update(updatedTeacher).eq("id", currentTeacher.id);
    if (!error) {
      setOverlayVisible(false);
      fetchTeachers(); 
    } else {
      console.error("Error updating teacher:", error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <main className="dashboard-content">
        <h2 className="dashboard-title">Teacher Account Management</h2>

        <div className="search-filter">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search by Name or School ID..."
              className="search-bar"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="search-btn" onClick={handleSearch}>
              <FaSearch />
            </button>
          </div>
          <button className="add-user-btn" onClick={() => navigate("/add-user")}>
            Add User
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>School ID</th>
                <th>First Name</th>
                <th>Middle Name</th>
                <th>Last Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher, index) => (
                  <tr key={teacher.id}>
                    <td>{index + 1}</td>
                    <td>{teacher.school_id}</td>
                    <td>{teacher.first_name}</td>
                    <td>{teacher.middle_name || "N/A"}</td>
                    <td>{teacher.last_name}</td>
                    <td>{teacher.email}</td>
                    <td>{teacher.contact_number}</td>
                    <td>
                      <div className="actions-container">
                        <button className="edit-btn" onClick={() => handleEditClick(teacher)}>
                          <FaUserEdit />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
                    No Data found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {overlayVisible && (
          <div className="lf-overlay">
            <div className="lf-modal">
              <button className="lf-close-btn" onClick={() => setOverlayVisible(false)}>
                <FaTimes />
              </button>
              <h2>{editing ? "Edit" : "Teacher Details"}</h2>

              <div className="lf-user-details">
                {editing ? (
                  <>
                    <p><strong>School ID:</strong> <input type="text" name="school_id" value={updatedTeacher.school_id} onChange={(e) => setUpdatedTeacher({ ...updatedTeacher, school_id: e.target.value })} /></p>
                    <p><strong>First Name:</strong> <input type="text" name="first_name" value={updatedTeacher.first_name} onChange={(e) => setUpdatedTeacher({ ...updatedTeacher, first_name: e.target.value })} /></p>
                    <p><strong>Middle Name:</strong> <input type="text" name="middle_name" value={updatedTeacher.middle_name || ""} onChange={(e) => setUpdatedTeacher({ ...updatedTeacher, middle_name: e.target.value })} /></p>
                    <p><strong>Last Name:</strong> <input type="text" name="last_name" value={updatedTeacher.last_name} onChange={(e) => setUpdatedTeacher({ ...updatedTeacher, last_name: e.target.value })} /></p>
                    <p><strong>Email:</strong> <input type="email" name="email" value={updatedTeacher.email} onChange={(e) => setUpdatedTeacher({ ...updatedTeacher, email: e.target.value })} /></p>
                    <p><strong>Contact Number:</strong> <input type="text" name="contact_number" value={updatedTeacher.contact_number || ""} onChange={(e) => setUpdatedTeacher({ ...updatedTeacher, contact_number: e.target.value })} /></p>
                    <button className="lf-save-btn" onClick={handleSaveChanges}>Save Changes</button>
                  </>
                ) : (
                  <>
                    <p><strong>School ID:</strong> {currentTeacher.school_id}</p>
                    <p><strong>First Name:</strong> {currentTeacher.first_name}</p>
                    <p><strong>Middle Name:</strong> {currentTeacher.middle_name || "N/A"}</p>
                    <p><strong>Last Name:</strong> {currentTeacher.last_name}</p>
                    <p><strong>Email:</strong> {currentTeacher.email}</p>
                    <p><strong>Contact Number:</strong> {currentTeacher.contact_number || "N/A"}</p>
                  </>
                )}
              </div>

              <div className="lf-actions">
                <button className="lf-edit-btn" onClick={() => setEditing(!editing)}>
                  <FaUserEdit /> {editing ? "Cancel" : "Edit"}
                </button>
                <button className="lf-delete-btn" onClick={() => handleDeleteClick(currentTeacher.id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherAccounts;
