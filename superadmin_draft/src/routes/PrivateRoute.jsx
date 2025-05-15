import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children, requiredRole }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  if (loading) return <p>Loading...</p>;
  if (!user) return <Navigate to="/" />;
  if (user.role !== requiredRole) return <Navigate to="/unauthorized" />;

  return children;
};

export default PrivateRoute;
