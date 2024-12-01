"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [admin, setAdmin] = useState(true); 
  const [empUsername, setEmpUsername] = useState("");
  const [empPassword, setEmpPassword] = useState("");
  const router = useRouter();

  // Employee Login
const empLogin = async () => {
  setError("");
  try {
    const res = await fetch("http://localhost:8000/employee/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        username: empUsername,
        password: empPassword,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.access_token);
      alert("Login successful!");
      router.push("/allPages/employee-profile");
    } else {
      const errorData = await res.json();
      console.log(errorData);
      setError(errorData.detail || "Login failed.");
    }
  } catch (err) {
    setError("An error occurred, please try again.");
  }
};


  // Admin Login
  const handleLogin = async () => {
    setError("");
    try {
      const response = await fetch("http://localhost:8000/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          username: username,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        alert("Login successful!");
        router.push("/allPages/profile");
      } else {
        const errorData = await response.json();
        setError(errorData.detail || "Login failed.");
      }
    } catch (err) {
      setError("An error occurred, please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center h-[100vh]">
      <div className="flex flex-col items-center">
        <button
          onClick={() => setAdmin(true)}
          className={`mb-4 px-4 py-2 rounded ${admin ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
        >
          Admin Login
        </button>
        <button
          onClick={() => setAdmin(false)}
          className={`mb-4 px-4 py-2 rounded ${!admin ? 'bg-gray-600 text-white' : 'bg-gray-200'}`}
        >
          Employee Login
        </button>

        {admin ? (
          <div className="w-[400px] h-[350px] bg-slate-300 flex flex-col p-10 gap-5">
            <div className="text-2xl font-semibold">Admin Login</div>
            <div className="h-[1px] bg-black mb-5"></div>

            <div className="flex flex-col">
              <label htmlFor="username">Username:</label>
              <input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="rounded p-1 h-[27px] w-[280px]"
                type="text"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="password">Password:</label>
              <input
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded p-1 h-[27px] w-[280px]"
                type="password"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex justify-center">
              <button
                onClick={handleLogin}
                className="w-[100px] bg-white rounded hover:text-white hover:bg-black"
              >
                Login
              </button>
            </div>
          </div>
        ) : (
          <div className="w-[400px] h-[350px] bg-blue-300 flex flex-col p-10 gap-5">
            <div className="text-2xl font-semibold">Employee Login</div>
            <div className="h-[1px] bg-black mb-5"></div>

            <div className="flex flex-col">
              <label htmlFor="empUsername">Username:</label>
              <input
                id="empUsername"
                value={empUsername}
                onChange={(e) => setEmpUsername(e.target.value)}
                className="rounded p-1 h-[27px] w-[280px]"
                type="text"
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="empPassword">Password:</label>
              <input
                id="empPassword"
                value={empPassword}
                onChange={(e) => setEmpPassword(e.target.value)}
                className="rounded p-1 h-[27px] w-[280px]"
                type="password"
              />
            </div>

            {error && <div className="text-red-500 text-sm">{error}</div>}

            <div className="flex justify-center">
              <button
                onClick={empLogin}
                className="w-[100px] bg-white rounded hover:text-white hover:bg-black"
              >
                Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
