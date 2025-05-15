import React, { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/assignStudents.css";
import Sidebar from './Sidebar';

const ITEMS_PER_PAGE = 8;

const AssignStudents = () => {
  const navigate = useNavigate();
  const { sectionName } = useParams();
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUnassignedStudents();
  }, []);

  const fetchUnassignedStudents = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("id, first_name, middle_name, last_name, school_id")
      .is("section_id", null)
      .eq("role", "Student");

    if (error) {
      console.error("Error fetching students:", error);
    } else {
      setStudents(data);
      setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE));
      setCurrentPage(1); 
    }
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleAssign = async () => {
    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    const { data: section } = await supabase
      .from("sections")
      .select("id")
      .eq("section_name", sectionName)
      .single();

    const updates = selectedStudents.map((id) =>
      supabase.from("users").update({ section_id: section.id }).eq("id", id)
    );

    await Promise.all(updates);
    alert("Students assigned successfully!");
    navigate(`/manage-section/${sectionName}`);
  };

  const indexOfLast = currentPage * ITEMS_PER_PAGE;
  const indexOfFirst = indexOfLast - ITEMS_PER_PAGE;
  const currentStudents = students.slice(indexOfFirst, indexOfLast);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="assign-students-container">
      <Sidebar />
      <h2 className="section-titles">
        Assign Students to Section: <span className="highlight">{sectionName}</span>
      </h2>

      <div className="table-containerr">
        <table className="animated-table">
          <thead>
            <tr>
              <th>Select</th>
              <th>School ID</th>
              <th>First Name</th>
              <th>Middle Name</th>
              <th>Last Name</th>
            </tr>
          </thead>
          <tbody>
            {currentStudents.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "1rem" }}>
                  No available students to assign.
                </td>
              </tr>
            ) : (
              currentStudents.map((student) => (
                <tr key={student.id}>
                  <td>
                    <input
                      type="checkbox"
                      onChange={() => handleCheckboxChange(student.id)}
                      checked={selectedStudents.includes(student.id)}
                    />
                  </td>
                  <td>{student.school_id}</td>
                  <td>{student.first_name}</td>
                  <td>{student.middle_name || "N/A"}</td>
                  <td>{student.last_name}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {students.length > 0 && (
        <div className="assign-pagination">
          <button onClick={handlePrev} disabled={currentPage === 1}>Prev</button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={currentPage === index + 1 ? "active" : ""}
            >
              {index + 1}
            </button>
          ))}
          <button onClick={handleNext} disabled={currentPage === totalPages}>Next</button>
        </div>
      )}

      <div className="assign-controls">
        <button className="assign-btn" onClick={handleAssign}>Assign Selected</button>
        <button className="cancel-btn" onClick={() => navigate(`/manage-section/${sectionName}`)}>Cancel</button>
      </div>
    </div>
  );
};

export default AssignStudents;
