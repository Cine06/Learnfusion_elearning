import React, { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import { FaSearch } from "react-icons/fa";
import { supabase } from "/utils/supabaseClient";
import "./Admin_style.css";
import { useNavigate } from "react-router-dom";

const SectionManagement = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const [newSection, setNewSection] = useState("");
  const [selectedSection, setSelectedSection] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState("");

  useEffect(() => {
    fetchSections();
    fetchTeachers();
    // Removed interval polling. Consider a manual refresh button or Supabase real-time for updates.
    // const interval = setInterval(fetchSections, 10000); 
    // return () => clearInterval(interval);
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from("sections")
      .select(`
        id, 
        section_name, 
        student_count, 
        teacher_id,
        users!sections_teacher_id_fkey(id, first_name, last_name)
      `)
      .order("section_name", { ascending: true });

    if (error) {
      console.error("Error fetching sections:", error.message);
    } else {
      setSections(data);
    }
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase.from("users").select("*").eq("role", "Teacher");
    if (error) {
      console.error("Error fetching teachers:", error.message);
    } else {
      setTeachers(data);
    }
  };

  const handleAddSection = async () => {
    if (newSection.trim() !== "" && selectedTeacher) {
      const { data, error } = await supabase.from("sections").insert([
        { section_name: newSection, teacher_id: selectedTeacher }
      ]).select(); // select() to get inserted row

      if (error) {
        console.error("Error adding section:", error); // Full error object
      } else {
        setSections((prevSections) => [...prevSections, data[0]]);
        setNewSection("");
        setSelectedTeacher("");
      }
    }
  };

  const handleRemoveSection = async (sectionId) => {
    const confirmDelete = window.confirm("Are you sure you want to remove this section?");
    if (confirmDelete) {
      await supabase.from("sections").delete().eq("id", sectionId);
      setSections(sections.filter((section) => section.id !== sectionId));
    }
  };

  const handleManageSection = (section) => {
    setSelectedSection(section);
    navigate(`/manage-section/${section.section_name}`);
  };

  const handleSearch = () => {
    // Filtering is now done client-side on the fetched sections
    // If server-side search is desired, this function would make an API call
    // For now, the client-side filter in the map function handles search.
    // If search is empty, the filter condition `section.section_name.toLowerCase().includes(search.toLowerCase())` will be true for all.
  };

  const handleTeacherChange = (e) => {
    setSelectedTeacher(e.target.value);
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <main className="dashboard-content">
        <div className="content">
          <h2>Section Management</h2>
          <div className="search-filter">
            <div className="search-container">
              <input
                type="text"
                placeholder="Search..."
                className="search-bar"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button className="search-btn" onClick={handleSearch}>
                <FaSearch />
              </button>
            </div>

            <div className="add-section">
              <input
                type="text"
                placeholder="New section name"
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="new-section-input"
              />
              <select
                value={selectedTeacher}
                onChange={handleTeacherChange}
                className="new-section-input"
              >
                <option value="">Select Teacher</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.first_name} {teacher.last_name}
                  </option>
                ))}
              </select>
              <button onClick={handleAddSection} className="add-user-btn">
                Add Section
              </button>
            </div>
            <button onClick={fetchSections} className="refresh-btn" style={{ marginLeft: '10px', padding: '10px 15px' }}>
              Refresh List
            </button>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Section</th>
                  <th>Teacher</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.length > 0 ? (
                  sections
                    .filter((section) =>
                      section.section_name.toLowerCase().includes(search.toLowerCase())
                    )
                    .map((section, index) => (
                      <tr key={section.id}>
                        <td>{index + 1}</td>
                        <td>{section.section_name}</td>
                        <td>
                          {section.users
                            ? `${section.users.first_name} ${section.users.last_name}`
                            : "No Teacher Assigned"}
                        </td>
                        <td>{section.student_count ?? 0}</td>
                        <td>
                          <div className="lf-actions">
                            <button
                              className="remove-btn"
                              onClick={() => handleRemoveSection(section.id)}
                            >
                              🗑 Remove
                            </button>
                            <button
                              className="edit-btn"
                              onClick={() => handleManageSection(section)}
                            >
                              👤 Manage
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
        </div>
      </main>
    </div>
  );
};

export default SectionManagement;
