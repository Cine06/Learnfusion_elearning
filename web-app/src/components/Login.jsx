import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import bcrypt from "bcryptjs";
import "../styles/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data: user, error: fetchError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .single();

      if (fetchError || !user) {
        throw new Error("Invalid email or password.");
      }

      if (user.status === "Inactive") {
        throw new Error("Your account is deactivated. Contact the administrator.");
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid email or password.");
      }

      if (user.role !== "Teacher") {
        throw new Error("Only teacher accounts are allowed to log in here.");
      }

      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("TeacherId", user.id);
      localStorage.setItem("TeacherName", `${user.first_name} ${user.last_name}`);
      localStorage.setItem("teacherProfilePic", user.profile_picture || "");

      navigate("/teacher-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <img src="/logo.png" alt="LearnFusion Logo" className="logo" />
        <h2 className="tagline">ELEVATE YOUR SKILLS WITH LEARNFUSION</h2>
      </div>

      <div className="login-right">
        <h1 className="brand-title">
          <span className="highlights">Learn</span>Fusion
        </h1>

        <form className="login-form" onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="button-container">
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
          {error && <p className="error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
