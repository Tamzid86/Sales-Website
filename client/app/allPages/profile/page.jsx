"use client";

import Navbar from "@/app/component/navbar";
import { useState, useEffect } from "react";

export default function Profile() {
  const [ownersName, setOwnersName] = useState("");
  const [ownerWallet, setOwnerWallet] = useState(0);
  const [companyWallet, setCompanyWallet] = useState(0);
  const [error, setError] = useState(""); 

  const fetchOwnerData = async () => {
    setError(""); 
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized: Token not found");
        return;
      }

      const res = await fetch("http://localhost:8000/get-owner", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`, 
        },
      });

      if (res.ok) {
        const data = await res.json();
        setOwnersName(data.fullName);
        setOwnerWallet(data.ownerWallet);
        setCompanyWallet(data.companyWallet);
      } else {
        const errorData = await res.json();
        setError(errorData.detail || "Failed to fetch owner data.");
      }
    } catch (err) {
      setError("An error occurred, please try again.");
    }
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
  <Navbar variable1="Products" variable2="Employees" link1="/allPages/product" link2="/allPages/employees" />
  <div className="flex justify-center items-center py-10">
    <div className="w-[500px] bg-white shadow-lg rounded-lg p-6">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
        Owner's Dashboard
      </h1>
      {error && (
        <div className="text-red-500 bg-red-100 border border-red-400 rounded-lg p-3 mb-4 text-center">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-700 font-medium">Owner's Name:</span>
          <span className="text-gray-900 font-bold">{ownersName}</span>
        </div>
        <div className="flex justify-between border-b pb-2">
          <span className="text-gray-700 font-medium">
            Owner's Personal Balance:
          </span>
          <span className="text-gray-900 font-bold">{ownerWallet} Taka</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-700 font-medium">
            Company's Total Income:
          </span>
          <span className="text-gray-900 font-bold">{companyWallet} Taka</span>
        </div>
      </div>
    </div>
  </div>
</div>

  );
}
