// DailyExport.js
import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import {getAllCustomers } from '../utils/db'


const DailyExport = () => {
  const [customers, setCustomers] = useState([])
  useEffect(() =>{
    async function loadCustomers(){
      const fetchedCustomers = await getAllCustomers();
      setCustomers(fetchedCustomers);
      console.log("Fetched customers:", fetchedCustomers);
    }
    loadCustomers();
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 pb-10 mb-20">
      <Navbar />

      <div className="px-6 md:px-12 lg:px-24 mt-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-6">📅 Daily Collection Export</h2>

        {/* Date Picker and Total */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label htmlFor="date" className="text-gray-700 font-medium">Select Date:</label>
            <input
              type="date"
              id="date"
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-gray-800 font-semibold text-lg">
            Total Collected Today: <span className="text-green-700">₨ 0</span>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition">
            Export Excel
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition">
            Export PDF
          </button>
        </div>

        {/* Daily Collection Table */}
        <div className="overflow-x-auto rounded-lg shadow-lg bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="px-4 py-2 text-left">S.N</th>
                <th className="px-4 py-2 text-left">Customer Name</th>
                <th className="px-4 py-2 text-left">Deposit</th>
                <th className="px-4 py-2 text-left">Collected</th>
                <th className="px-4 py-2 text-left">Due</th>
                <th className="px-4 py-2 text-left">Last Collected</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Example rows */}
              {customers.map((customer, index) => ( 
                <tr key = {customer.id} className="text-gray-800 hover:bg-gray-50">
                <td className="px-4 py-2">{index+1}</td>
                <td className="px-4 py-2">{customer.name}</td>
                <td className="px-4 py-2">{customer.deposit}</td>
                <td className="px-4 py-2">{customer.collected}</td>
                <td className="px-4 py-2">{customer.due}</td>
                <td className="px-4 py-2">{customer.lastCollected}</td>
              </tr>
              ))}
              {/* More rows can be dynamically added */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyExport;
  