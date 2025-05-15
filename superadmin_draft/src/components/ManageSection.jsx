import React, { useState, useEffect } from "react";
import { FaTrash, FaSearch } from "react-icons/fa";
import { supabase } from "/utils/supabaseClient";
import AdminSidebar from "./AdminSidebar";
import { useParams, useNavigate } from "react-router-dom";
import "./Admin_style.css";

const ManageSection = () => {
  const { sectionName } = useParams();
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);

  useEffect(() => {
    fetchSectionDetails();
    fetchAvailableTeachers();
  }, [sectionName]);

  useEffect(() => {
    handleSearch();
  }, [searchTerm, students]);

  const fetchSectionDetails = async () => {
    try {
      const { data: sectionData, error: sectionError } = await supabase
        .from("sections")
        .select("id, teacher_id")
        .eq("section_name", sectionName)
        .single();

      if (sectionError) {
        console.error("Error fetching section details:", sectionError.message);
        return;
      }

      const sectionId = sectionData?.id;
      setSelectedTeacher(sectionData?.teacher_id || "");

      const { data: studentData, error: studentError } = await supabase
        .from("users")
        .select("id, school_id, first_name, middle_name, last_name, email, contact_number")
        .eq("section_id", sectionId)
        .eq("role", "Student");

      if (studentError) {
        console.error("Error fetching students:", studentError.message);
        return;
      }

      setStudents(studentData);
      setFilteredStudents(studentData);
    } catch (error) {
      console.error("Error fetching section details:", error.message);
    }
  };

  const fetchAvailableTeachers = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, last_name")
      .eq("role", "Teacher");

    if (error) {
      console.error("Error fetching available teachers:", error.message);
    } else {
      setAvailableTeachers(data);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter((student) =>
      student.school_id.toString().includes(searchTerm.trim()) ||
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.middle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  };

  const handleRemoveStudent = async (studentId) => {
    const confirmRemove = window.confirm("Are you sure you want to remove this student from the section? This action will not delete their account.");
    if (!confirmRemove) return;

    const { error } = await supabase
      .from("users")
      .update({ section_id: null })
      .eq("id", studentId);

    if (error) {
      console.error("Error removing student:", error.message);
    } else {
      fetchSectionDetails();
    }
  };

  const handleChangeTeacher = async (teacherId) => {
    const { error } = await supabase
      .from("sections")
      .update({ teacher_id: teacherId })
      .eq("section_name", sectionName);

    if (error) {
      console.error("Error changing teacher:", error.message);
    } else {
      setSelectedTeacher(teacherId);
      fetchSectionDetails();
    }
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <main className="dashboard-content">
        <h2 className="dashboard-title">Manage Section: {sectionName}</h2>
        <div className="search-filter">
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
            
            <p>Teacher: </p>
          <select
            value={selectedTeacher}
            onChange={(e) => handleChangeTeacher(e.target.value)}
          >
            <option value="">Select Teacher</option>
            {availableTeachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>
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
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student, index) => (
                  <tr key={student.id}>
                    <td>{index + 1}</td>
                    <td>{student.school_id}</td>
                    <td>{student.first_name}</td>
                    <td>{student.middle_name || "N/A"}</td>
                    <td>{student.last_name}</td>
                    <td>{student.email}</td>
                    <td>{student.contact_number}</td>
                    <td>
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", padding: "10px" }}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <button onClick={() => navigate("/sectionmanage")} className="lf1-close-btn">
          Back
        </button>
      </main>
    </div>
  );
};

export default ManageSection;