"use client";

import React, { useState, useEffect } from "react";
import "./Login.css";
import Dashboard from "../../components/SMS/Dashboard";
import axios from "axios";
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
});


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
   useEffect(() => setIsMounted(true), []);
  if (!isMounted) 
    return null;


  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      alert("Please enter both username and password");
      return;
    }
    


   
  try {
    const requestUrl = `${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/get?username=${username}`;
    console.log("Request URL:", requestUrl);

    const response = await axios.get(requestUrl);

    const user = response.data;

    if (user.password === password) {
      console.log("✅ Login successful");
      setIsLoggedIn(true);
    } else {
      alert("❌ Incorrect password");
    }
  } catch (error) {
    if (error.response?.status === 404) {
      alert("❌ User not found (404)");
    } else {
      console.error("Login error:", error);
      alert("❌ Login failed. Please try again later.");
    }
  }
};
  // If logged in, show Dashboard component
  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div className={`${roboto.className} login-container`}>
      <h1 className="login-title">Sign In</h1>

      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <div className="input-icon">👤</div>
          <input
            type="text"
            className="login-input"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>

        <div className="input-group">
          <div className="input-icon">🔒</div>
          <input
            type="password"
            className="login-input"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>

        <button type="submit" className="login-button">
          LOGIN
        </button>
      </form>
    </div>
  );
}
