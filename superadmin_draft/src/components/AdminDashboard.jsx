import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTrash, FaSearch } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { supabase } from "/utils/supabaseClient";
import "./Admin_style.css";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedRole, users]);

  const fetchUsers = async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
      console.error("Error fetching users:", error.message);
    } else {
      setUsers(data);
      setFilteredUsers(data);
    }
  };

  const applyFilters = () => {
    let filtered = users;

    if (selectedRole !== "All") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = () => {
    let filtered = users;
  
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
  
      filtered = filtered.filter((user) => {
        const schoolIdMatch = user.school_id.toString().includes(searchTerm.trim());
        const firstNameMatch = user.first_name.toLowerCase().includes(lowerSearch);
        const middleNameMatch = user.middle_name?.toLowerCase().includes(lowerSearch);
        const lastNameMatch = user.last_name.toLowerCase().includes(lowerSearch);
        
        return schoolIdMatch || firstNameMatch || middleNameMatch || lastNameMatch;
      });
    }
  
    if (selectedRole !== "All") {
      filtered = filtered.filter((user) => user.role === selectedRole);
    }
  
    setFilteredUsers(filtered);
  };
  
  
  const handleStatusChange = async (userId, newStatus) => {
    const { error } = await supabase
      .from("users")
      .update({ status: newStatus })
      .eq("id", userId);
    if (!error) fetchUsers();
  };

  const handleDeleteUser = async (userId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user? This action cannot be undone.");
    if (!confirmDelete) return;

    const { error } = await supabase.from("users").delete().eq("id", userId);
    if (!error) fetchUsers();
  };

  return (
    <div className="dashboard-container">
      <AdminSidebar />
      <main className="dashboard-content">
        <h2 className="dashboard-title">Account Management</h2>

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
          <select
            className="role-filter"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
          >
            <option value="All">All</option>
            <option value="Admin">Admin</option>
            <option value="Teacher">Teacher</option>
            <option value="Student">Student</option>
          </select>
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
                <th>Role</th>
                <th>Contact Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user.id}>
                    <td>{index + 1}</td>
                    <td>{user.school_id}</td>
                    <td>{user.first_name}</td>
                    <td>{user.middle_name || "N/A"}</td>
                    <td>{user.last_name}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.contact_number}</td>
                    <td>
                      <div className="actions-container">
                        <select
                          className="status-dropdown"
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Deactive</option>
                        </select>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteUser(user.id)}
                        >
                          <FaTrash /> Delete
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
      </main>
    </div>
  );
};

export default AdminDashboard;
