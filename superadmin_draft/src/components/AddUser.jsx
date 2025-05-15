import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "/utils/supabaseClient"; 
import "./Admin_style.css";
import AdminSidebar from "./AdminSidebar";
import bcrypt from "bcryptjs";

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    schoolId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    email: "",
    contact_number: "",
    password: "",
    role: "",
    section: "",
  });
  
  const [sections, setSections] = useState([]); 

  useEffect(() => {
    const fetchSections = async () => {
      const { data, error } = await supabase
        .from("sections")
        .select("id, section_name");

      if (error) {
        console.error("Error fetching sections:", error.message);
      } else {
        setSections(data); 
      }
    };

    fetchSections();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const hashedPassword = await bcrypt.hash(formData.password, 10);
  
      let sectionId = null;
      if (formData.role === "Student" && formData.section) {
        const selectedSection = sections.find(section => section.id === formData.section);
        if (selectedSection) {
          sectionId = selectedSection.id;
        } else {
          throw new Error("Section not found");
        }
      }
  
      const { data, error } = await supabase.from("users").insert([
        {
          school_id: formData.schoolId,
          first_name: formData.firstName,
          middle_name: formData.middleName,
          last_name: formData.lastName,
          email: formData.email,
          contact_number: formData.contact_number,
          password: hashedPassword,
          role: formData.role,
          section_id: sectionId,
        },
      ]);
  
      if (error) {
        throw error;
      }
  
      alert("User added successfully!");
      setFormData({
        schoolId: "",
        firstName: "",
        middleName: "",
        lastName: "",
        email: "",
        contact_number: "",
        password: "",
        role: "",
        section: "",
      });
    } catch (error) {
      console.error("Error adding user:", error.message);
      alert("Failed to add user. Please try again.");
    }
  };
  

  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <div className="form-container">
        <form onSubmit={handleSubmit} className="add-user-form">
          <h2 className="form-title">Creating New Account</h2>

          <label>Role:</label>
          <select name="role" value={formData.role} onChange={handleChange} required>
            <option value="">Select Role</option>
            <option value="Admin">Admin</option>
            <option value="Teacher">Teacher</option>
            <option value="Student">Student</option>
          </select>

          <label>School ID:</label>
          <input type="text" name="schoolId" value={formData.schoolId} onChange={handleChange} required />

          <label>Firstname:</label>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />

          <label>Middlename:</label>
          <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} />

          <label>Lastname:</label>
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />

          {formData.role === "Student" && (
            <>
              <label>Section:</label>
              <select name="section" value={formData.section} onChange={handleChange} required>
                <option value="">Select Section</option>
                {sections.map((section) => (
                  <option key={section.id} value={section.id}>
                    {section.section_name}
                  </option>
                ))}
              </select>
            </>
          )}

          <label>Email:</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />

          <label>Contact number:</label>
          <input type="text" name="contact_number" value={formData.contact_number} onChange={handleChange} required />

          <label>Password:</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />

          <button type="submit" className="add-user-btn">Add User</button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
