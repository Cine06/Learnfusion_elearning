import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserEdit, FaTrash, FaSearch, FaTimes } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { supabase } from "/utils/supabaseClient";
import "./Admin_style.css";

const StudentAccounts = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [editing, setEditing] = useState(false);
  const [updatedStudent, setUpdatedStudent] = useState({});
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [sections, setSections] = useState([]); 

  useEffect(() => {
    fetchStudents();
    fetchSections(); 
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, school_id, first_name, middle_name, last_name, email, contact_number, section_id, sections:section_id(section_name)")
      .eq("role", "Student");
  
    if (error) {
      console.error("Error fetching students:", error.message);
    } else {
      console.log("Fetched students: ", data); 
      setStudents(data);
      setFilteredStudents(data);
    }
  };
  
  const fetchSections = async () => {
    const { data, error } = await supabase.from("sections").select("*");
    if (error) {
      console.error("Error fetching sections:", error.message);
    } else {
      setSections(data);
    }
  };

  const handleSearch = () => {
    const filtered = students.filter((student) =>
      student.school_id.toString().includes(searchTerm.trim()) ||
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.middle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleEditClick = (student) => {
    setCurrentStudent(student);
    setUpdatedStudent({ ...student }); 
    setEditing(false);
    setOverlayVisible(true);
  };

  const handleDeleteClick = async (studentId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this student?");
    if (confirmDelete) {
      const { error } = await supabase.from("users").delete().eq("id", studentId);
      if (!error) {
        fetchStudents(); 
      } else {
        console.error("Error deleting student:", error.message);
      }
    }
  };

  const handleSaveChanges = async () => {
    try {
      const { error } = await supabase.from("users").update({
        school_id: updatedStudent.school_id,
        first_name: updatedStudent.first_name,
        middle_name: updatedStudent.middle_name,
        last_name: updatedStudent.last_name,
        email: updatedStudent.email,
        contact_number: updatedStudent.contact_number,
        section_id: updatedStudent.section_id 
      }).eq("id", currentStudent.id);
  
      if (error) {
        console.error("Error updating student:", error.message);
      } else {
        setOverlayVisible(false);
        fetchStudents(); 
      }
    } catch (error) {
      console.error("Error updating student:", error.message);
    }
  };
  

  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <main className="dashboard-content">
        <h2 className="dashboard-title">Student Account Management</h2>

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
                <th>Section</th>
                <th>Contact Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
                  {filteredStudents.length > 0 ? (
                    filteredStudents.map((student, index) => (
                      <tr key={student.id}>
                        <td>{index + 1}</td>
                        <td>{student.school_id}</td>
                        <td>{student.first_name}</td>
                        <td>{student.middle_name || "N/A"}</td>
                        <td>{student.last_name}</td>
                        <td>{student.email}</td>
                        <td>{student.sections ? student.sections.section_name : "No Section"}</td>
                        <td>{student.contact_number}</td>
                        <td>
                          <div className="actions-container">
                            <button className="edit-btn" onClick={() => handleEditClick(student)}>
                              <FaUserEdit />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" style={{ textAlign: "center", padding: "10px" }}>
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
              <h2>{editing ? "Edit" : "Student Details"}</h2>

              <div className="lf-user-details">
                {editing ? (
                  <>
                    <p><strong>School ID:</strong> <input type="text" name="school_id" value={updatedStudent.school_id} onChange={(e) => setUpdatedStudent({ ...updatedStudent, school_id: e.target.value })} /></p>
                    <p><strong>First Name:</strong> <input type="text" name="first_name" value={updatedStudent.first_name} onChange={(e) => setUpdatedStudent({ ...updatedStudent, first_name: e.target.value })} /></p>
                    <p><strong>Middle Name:</strong> <input type="text" name="middle_name" value={updatedStudent.middle_name || ""} onChange={(e) => setUpdatedStudent({ ...updatedStudent, middle_name: e.target.value })} /></p>
                    <p><strong>Last Name:</strong> <input type="text" name="last_name" value={updatedStudent.last_name} onChange={(e) => setUpdatedStudent({ ...updatedStudent, last_name: e.target.value })} /></p>
                    <p><strong>Email:</strong> <input type="email" name="email" value={updatedStudent.email} onChange={(e) => setUpdatedStudent({ ...updatedStudent, email: e.target.value })} /></p>
   
                    <p><strong>Section: </strong>
                      <select
                        name="section"
                        value={updatedStudent.section_id || ""}
                        onChange={(e) => setUpdatedStudent({ ...updatedStudent, section_id: e.target.value })}
                      >
                        <option value="">Select Section</option>
                        {sections.map((section) => (
                          <option key={section.id} value={section.id}>
                            {section.section_name}
                          </option>
                        ))}
                      </select>
                    </p>
              
                    

                    <p><strong>Contact Number:</strong> <input type="text" name="contact_number" value={updatedStudent.contact_number || ""} onChange={(e) => setUpdatedStudent({ ...updatedStudent, contact_number: e.target.value })} /></p>
                    <button className="lf-save-btn" onClick={handleSaveChanges}>Save Changes</button>
                  </>
                ) : (
                  <>
                    <p><strong>School ID:</strong> {currentStudent.school_id}</p>
                    <p><strong>First Name:</strong> {currentStudent.first_name}</p>
                    <p><strong>Middle Name:</strong> {currentStudent.middle_name || "N/A"}</p>
                    <p><strong>Last Name:</strong> {currentStudent.last_name}</p>
                    <p><strong>Email:</strong> {currentStudent.email}</p>
                    <p><strong>Section:</strong> {currentStudent.sections ? currentStudent.sections.section_name : "No Section"}</p>
                    <p><strong>Contact Number:</strong> {currentStudent.contact_number}</p>
                  </>
                )}
              </div>

              <div className="lf-actions">
                <button className="lf-edit-btn" onClick={() => setEditing(!editing)}>
                  <FaUserEdit /> {editing ? "Cancel" : "Edit"}
                </button>
                <button className="lf-delete-btn" onClick={() => handleDeleteClick(currentStudent.id)}>
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

export default StudentAccounts;
