import React, { useState, useEffect } from "react";
import { FaTrash, FaSearch } from "react-icons/fa";
import { supabase } from "../utils/supabaseClient";
import Sidebar from "./Sidebar";
import { useParams, useNavigate } from "react-router-dom";
import "../styles/sections.css";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];
const defaultProgressData = [
  { name: "Completed", value: 70 },
  { name: "In Progress", value: 20 },
  { name: "Not Started", value: 10 },
];

const StudentProgressModal = ({ student, onClose }) => {
  if (!student) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{student.first_name} {student.middle_name} {student.last_name}</h3>
        <p className="student-info">
          <span className="info-label">School ID:</span>
          <span className="info-value">{student.school_id}</span>

          <span className="info-label">Email:</span>
          <span className="info-value">{student.email}</span>

          <span className="info-label">Contact:</span>
          <span className="info-value">{student.contact_number}</span>
        </p>

        <hr />
        <h4>Awards:</h4>
        <ul>
          <li>Top Performer</li>
          <li>Perfect Quiz</li>
        </ul>
        <div className="progress-charts">
          {["Lesson Progress", "Quiz Progress", "Overall Progress"].map((title, idx) => (
            <div key={title}>
              <h5>{title}</h5>
              <PieChart width={200} height={200}>
                <Pie data={defaultProgressData} cx="50%" cy="50%" outerRadius={60} fill="#8884d8" dataKey="value" label>
                  {defaultProgressData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          ))}
        </div>
        <button className="modal-close-btn" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};


const ManageSection = () => {
  const { sectionName } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [teacherName, setTeacherName] = useState("Loading...");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const studentsPerPage = 10;
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const [selectedLesson, setSelectedLesson] = useState("");

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };
  

  useEffect(() => {
    fetchSectionDetails();
  }, [sectionName]);

  const fetchSectionDetails = async () => {
    try {
      const { data: sectionData } = await supabase
        .from("sections")
        .select("id, teacher_id")
        .eq("section_name", sectionName)
        .single();

      const sectionId = sectionData?.id;

      const { data: teacherData } = await supabase
        .from("users")
        .select("first_name, last_name")
        .eq("id", sectionData.teacher_id)
        .single();

      setTeacherName(`${teacherData.first_name} ${teacherData.last_name}`);

      const { data: studentData } = await supabase
        .from("users")
        .select("id, school_id, first_name, middle_name, last_name, email, contact_number")
        .eq("section_id", sectionId)
        .eq("role", "Student");

        setStudents(studentData);
        setFilteredStudents(studentData);
        setCurrentPage(1);
        
    } catch (error) {
      console.error("Error fetching:", error.message);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      setFilteredStudents(students);
      setCurrentPage(1); 
      return;
    }
  
    const filtered = students.filter((student) =>
      student.school_id.toString().includes(searchTerm.trim()) ||
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.middle_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  
    setFilteredStudents(filtered);
    setCurrentPage(1); 
  };
  

  const handleRemoveStudent = async (studentId) => {
    const confirmRemove = window.confirm("Are you sure?");
    if (!confirmRemove) return;

    const { error } = await supabase
      .from("users")
      .update({ section_id: null })
      .eq("id", studentId);

    if (!error) fetchSectionDetails();
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <h2 className="section-title">Manage Section: {sectionName}</h2>
        <div className="search-filter">
          <input
            type="text"
            placeholder="Search by Name or School ID..."
            className="search-bar"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="search-btnn" onClick={handleSearch}>
            <FaSearch />
          </button>
          <button
            onClick={() => sectionName && navigate(`/assign-students/${sectionName}`)}
            className="assign-btnnn"
          >
            Assign Students
          </button>
          <div className="lesson-report-controls">
            <select
              className="lesson-dropdown"
              value={selectedLesson}
              onChange={(e) => setSelectedLesson(e.target.value)}
            >
              <option value="">Select Lesson</option>
              <option value="Lesson 1">Lesson 1</option>
              <option value="Lesson 2">Lesson 2</option>
            </select>
            <button
              className="generate-report-btn"
              disabled={!selectedLesson}
              onClick={() => navigate(`/report/${sectionName}/${encodeURIComponent(selectedLesson)}`)}
            >
              Generate Report
            </button>
          </div>
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
                currentStudents.map((student, index) => (
                  <tr key={student.id} onClick={() => setSelectedStudent(student)} style={{ cursor: "pointer" }}>
                    <td>{indexOfFirstStudent + index + 1}</td>
                    <td>{student.school_id}</td>
                    <td>{student.first_name}</td>
                    <td>{student.middle_name || "N/A"}</td>
                    <td>{student.last_name}</td>
                    <td>{student.email}</td>
                    <td>{student.contact_number}</td>
                    <td>
                      <button className="remove-btn" onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveStudent(student.id);
                      }}>
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
          <div className="footer-controls">
              <div className="footer-left">
                <button onClick={() => navigate("/section")} className="back">Back</button>
              </div>
              <div className="footer-right pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={currentPage === i + 1 ? "active" : ""}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>

        </div>

        <StudentProgressModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      </main>
    </div>
  );
};

export default ManageSection;
