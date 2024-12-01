"use client";

import { useState, useEffect } from "react";
import Navbar from "@/app/component/navbar";

export default function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [newEmployee, setNewEmployee] = useState({
    username: "",
    fullName: "",
    password: "",
    email: "",
    number: "",
    reference: "",
    employeeWallet: 0,
  });

  const [isAdding, setIsAdding] = useState(false);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Token not found");
        return;
      }

      const res = await fetch("http://localhost:8000/get-employee", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to fetch employee list.");
      }
    } catch (err) {
      setError("An error occurred while fetching the employee list.");
    }
  };

  const handleDeleteEmployee = async (username) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/delete_employee/${username}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      if (res.ok) {
        setEmployees((prevEmployees) =>
          prevEmployees.filter((emp) => emp.username !== username)
        );
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to delete employee.");
      }
    } catch (err) {
      setError("An error occurred while deleting the employee.");
    }
    setLoading(false);
  };
  

  const handleAddEmployee = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Token not found");
        return;
      }

      const res = await fetch("http://localhost:8000/add_employee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newEmployee),
      });

      if (res.ok) {
        const addedEmployee = await res.json();
        setEmployees((prev) => [...prev, addedEmployee]); // Update the list with the new employee
        setIsAdding(false); // Close the add employee form
        setNewEmployee({
          username: "",
          fullName: "",
          password: "",
          email: "",
          number: "",
          reference: "",
          employeeWallet: 0,
        }); 
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to add employee.");
      }
      window.location.reload();
    } catch (err) {
      setError("An error occurred while adding the employee.");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div>
      <Navbar variable1="Profile" variable2="Product" link1="/allPages/profile" link2="/allPages/product" />
      <div className="p-4">
        <h1 className="font-semibold text-2xl mb-10">Employee List</h1>
  
        {error && typeof error === "string" && <div className="text-red-500 mb-4">{error}</div>}
  
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
          >
            Add Employee
          </button>
        )}
  
        <div className="grid grid-cols-4 gap-4">
          {employees.map((emp, idx) => (
            <div
              key={idx}
              className="bg-slate-200 w-full max-w-md p-4 rounded shadow hover:bg-slate-300"
            >
              <div className="font-semibold text-lg">{emp.fullName}</div>
              <div>Username: {emp.username}</div>
              <div>Email: {emp.email}</div>
              <div>Phone: {emp.number}</div>
              <div>
                Employee Wallet: <span className="font-bold">{emp.employeeWallet} Taka</span>
              </div>
              <div>Reference: {emp.reference || "N/A"}</div>
  
              <button
                onClick={() => handleDeleteEmployee(emp.username)} 
                className="bg-red-500 text-white px-4 py-2 mt-4 rounded hover:bg-red-600"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete Employee"}
              </button>
            </div>
          ))}
        </div>
  
        {isAdding && (
          <div className="bg-white p-4 border rounded shadow mb-4">
            <h2 className="text-lg font-semibold mb-2">Add New Employee</h2>
            <div className="flex flex-col gap-2">
              <input
                type="text"
                placeholder="Username"
                value={newEmployee.username}
                onChange={(e) => setNewEmployee({ ...newEmployee, username: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Full Name"
                value={newEmployee.fullName}
                onChange={(e) => setNewEmployee({ ...newEmployee, fullName: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="password"
                placeholder="Password"
                value={newEmployee.password}
                onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmployee.email}
                onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="text"
                placeholder="Phone Number"
                value={newEmployee.number}
                onChange={(e) => setNewEmployee({ ...newEmployee, number: e.target.value })}
                className="border p-2 rounded"
              />
              <input
                type="number"
                placeholder="Employee Wallet"
                value={newEmployee.employeeWallet}
                onChange={(e) =>
                  setNewEmployee({ ...newEmployee, employeeWallet: parseInt(e.target.value) })
                }
                className="border p-2 rounded"
              />
              <select
                value={newEmployee.reference}
                onChange={(e) => setNewEmployee({ ...newEmployee, reference: e.target.value })}
                className="border p-2 rounded"
              >
                <option value="">Select Reference</option>
                {employees.map((emp, idx) => (
                  <option key={idx} value={emp.username}>
                    {emp.username}
                  </option>
                ))}
              </select>
  
              <button
                onClick={handleAddEmployee}
                className="bg-green-500 text-white w-[120px] px-4 py-2 rounded hover:bg-green-600 mt-4"
              >
                Submit
              </button>
              <button
                onClick={() => setIsAdding(false)}
                className="bg-red-500 text-white px-4 py-2 w-[120px] rounded hover:bg-red-600 mt-2"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
}
