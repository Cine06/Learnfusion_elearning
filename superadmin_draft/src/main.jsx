import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// --- Mock Admin User for Direct Dashboard Access ---
// This simulates a logged-in admin user.
const mockAdminUser = {
  id: '00000000-0000-0000-0000-000000000000', // Example UUID
  first_name: 'Super',
  last_name: 'Admin',
  email: 'admin@example.com',
  role: 'Admin',
  profile_picture: null, // Or path to a default image
  status: 'Active'
};
localStorage.setItem("user", JSON.stringify(mockAdminUser));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
