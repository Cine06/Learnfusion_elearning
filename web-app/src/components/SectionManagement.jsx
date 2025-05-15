import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import { FaSearch } from "react-icons/fa";
import { supabase } from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";
import "../styles/sections.css";

const SectionManagement = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState([]);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); 
  const [newSection, setNewSection] = useState("");
  const [selectedSection, setSelectedSection] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    fetchCurrentUser();
  }, []);
  
  useEffect(() => {
    if (currentUser?.id) {
      fetchSections();
      const interval = setInterval(fetchSections, 10000);
      return () => clearInterval(interval);
    }
  }, [currentUser]);  

  const fetchCurrentUser = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
  
    if (storedUser && storedUser.role === "Teacher") {
      setCurrentUser(storedUser);
    } else {
      console.error("No valid teacher user found in localStorage.");
    }
  };
  

  const fetchSections = async () => {
    if (!currentUser?.id) return;

    const { data, error } = await supabase
      .from("sections")
      .select(`
        id, 
        section_name, 
        student_count, 
        teacher_id,
        users!sections_teacher_id_fkey(id, first_name, last_name)
      `)
      .eq("teacher_id", currentUser.id) 
      .order("section_name", { ascending: true });

    if (error) {
      console.error("Error fetching sections:", error.message);
    } else {
      setSections(data);
    }
  };

  const handleAddSection = async () => {
    if (newSection.trim() === "") {
      console.log("Please provide a section name.");
      return;
    }
  
    try {
      if (!currentUser || currentUser.role !== "Teacher") {
        console.error("Only teachers can add sections.");
        return;
      }
  
      const { data, error } = await supabase
        .from("sections")
        .select("id")
        .eq("section_name", newSection)
        .single();
  
      if (data) {
        window.alert("This section name already exists. Please choose a different name.");
        return;
      }
  
      const { data: insertedData, error: insertError } = await supabase
        .from("sections")
        .insert([
          {
            section_name: newSection,
            teacher_id: currentUser.id,
          },
        ])
        .select();
  
      if (insertError) {
        console.error("Error adding section:", insertError.message);
      } else {
        setSections((prev) => [...prev, insertedData[0]]);
        setNewSection("");
        window.alert("Section added successfully!"); 
      }
    } catch (error) {
      console.error("Unexpected error:", error);
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
    setSearchTerm(search.trim());
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <main className="dashboard-content">
        <div className="content">
          <h2 className="section-title">Section Management</h2>
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
              <button onClick={handleAddSection} className="add-user-btn">
                Add Section 
              </button>
            </div>
          </div>

          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Section</th>
                  <th>Students</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.length > 0 ? (
                  sections
                    .filter((section) =>
                      searchTerm === "" ||
                      section.section_name.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((section, index) => (
                      <tr key={section.id}>
                        <td>{index + 1}</td>
                        <td>{section.section_name}</td>
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
