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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== "text/csv" && !file.name.endsWith('.csv')) {
      alert("Please upload a valid CSV file.");
      event.target.value = null;
      return;
    }

    const { data: sectionData, error: sectionError } = await supabase
      .from("sections")
      .select("id")
      .eq("section_name", sectionName)
      .single();

    if (sectionError || !sectionData) {
      console.error("Error fetching section:", sectionError);
      alert("Could not find the section. Please ensure the section exists.");
      event.target.value = null; 
      return;
    }
    const currentSectionId = sectionData.id;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const text = e.target.result;
      const rows = text.split(/\r\n|\n/).filter(row => row.trim() !== ''); 

      if (rows.length <= 1) {
        alert("CSV file is empty or contains only a header.");
        return;
      }

      const header = rows[0].split(',').map(h => h.trim().toLowerCase());
      const expectedHeaders = ["school_id", "email", "first_name", "last_name"];
      const schoolIdIndex = header.indexOf("school_id");
      const emailIndex = header.indexOf("email");
      const firstNameIndex = header.indexOf("first_name");
      const middleNameIndex = header.indexOf("middle_name"); // Optional
      const lastNameIndex = header.indexOf("last_name");

      if (schoolIdIndex === -1 || emailIndex === -1 || firstNameIndex === -1 || lastNameIndex === -1) {
        alert("CSV header is missing required columns: school_id, email, first_name, last_name. Optional: middle_name.");
        return;
      }

      const studentsToUpsert = [];
      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',').map(v => v.trim());
        const school_id = values[schoolIdIndex];
        const email = values[emailIndex];
        const first_name = values[firstNameIndex];
        const last_name = values[lastNameIndex];
        const middle_name = middleNameIndex !== -1 ? values[middleNameIndex] : null;

        if (!school_id || !email || !first_name || !last_name) {
          console.warn(`Skipping row ${i + 1} in CSV due to missing required fields (school_id, email, first_name, last_name).`);
          continue; 
        }

        studentsToUpsert.push({
          school_id,
          email,
          first_name,
          middle_name: middle_name || null,
          last_name,
          role: "Student", // Default role
          section_id: currentSectionId,
        });
      }

      if (studentsToUpsert.length === 0) {
        alert("No valid student data found in the CSV to process.");
        return;
      }

      const { error: upsertError } = await supabase.from("users").upsert(studentsToUpsert, { onConflict: 'school_id' });

      if (upsertError) {
        console.error("Error upserting students:", upsertError);
        alert(`Error assigning students via CSV: ${upsertError.message}. Ensure 'school_id' is a unique constraint in your 'users' table if it's used for conflict resolution.`);
      } else {
        alert(`${studentsToUpsert.length} student(s) processed from CSV and assigned to section ${sectionName}!`);
        fetchUnassignedStudents(); // Refresh the list of unassigned students
      }
    };
    reader.onerror = () => {
      alert("Failed to read the CSV file.");
    };
    reader.readAsText(file);
    event.target.value = null; // Clear the file input for re-selection
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
        <input
          type="file"
          id="csvUpload"
          style={{ display: "none" }}
          accept=".csv"
          onChange={handleFileUpload}
        />
        <button
          type="button"
          onClick={() => document.getElementById('csvUpload').click()}
          className="upload-csv-btn" // You'll need to style this button
        >
          Upload CSV & Assign
        </button>
        <button className="assign-btn" onClick={handleAssign}>Assign Selected Manually</button>
        <button className="cancel-btn" onClick={() => navigate(`/manage-section/${sectionName}`)}>
          Back
        </button>
      </div>
    </div>
  );
};

export default AssignStudents;
