//customer/page.js

import React, { useEffect, useState } from 'react';
import Navbar from '../Components/Navbar';
import { addCustomer, getAllCustomers, updateCustomer, deleteCustomer } from '../utils/db'

const Customers = () => {
  const [customer, setCustomer] = useState([]);
  //from db
  useEffect(() => {
    async function loadCustomers() {
      const allCustomers = await getAllCustomers();
      setCustomer(allCustomers);
    }
    loadCustomers();
  }, [])
  const [showModal, setShowModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    deposit: '',
    frequency: '',
    totalCollected: 0,
    due: 0,
    lastCollectedDate: null,
  });
  const [editModal, setEditModal] = useState(false);
  const [editCustomerIndex, setEditCustomerIndex] = useState(null);
  const [editCustomerData, setEditCustomerData] = useState({ deposit: '', frequency: '' });
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [confirmIndex, setConfirmIndex] = useState(null);
  //bulk upload using excel
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkStats, setBulkStats] = useState([null]); //shows number of rows
  //excel file upload
  const [showExcelModal, setShowExcelModal] = useState(false);
  //search state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFrequency, setFilterFrequency] = useState('All'); // Daily, Weekly, Monthly

  const handleAddCustomer = () => setShowModal(true);

  const handleSubmit = async (isBulk=false) => {
    if(!isBulk){
    const depositNumber = parseFloat(newCustomer.deposit) || 0;
    if (!newCustomer.name) { alert("Name is required"); return; }
    if (!depositNumber | depositNumber <= 0) { alert("Deposit must be a positive number"); return; }
    if (!newCustomer.frequency) { alert("Please select the frequency"); return; }
    //prepare customer data
    const customerData = {
      ...newCustomer,
      deposit: depositNumber,
      totalCollected: 0,
      due: depositNumber,
      lastCollectedDate: null,
      startDate: new Date().toISOString().split("T")[0],
    };

    //save to indexDB
    const id = await addCustomer(customerData);

    //update react state
    setCustomer(prev => [...prev, { ...customerData, id }]);

    //reset form
    setNewCustomer({ name: '', deposit: '', frequency: 'Daily' });
    setShowModal(false);

}else{
  //bulk logic
  for (const row of bulkRows) {
    if (!row.name || !row.deposit || !row.frequency) continue; // skip incomplete rows
    const customerData = {
      ...row,
      totalCollected: 0,
      due: row.deposit,
      lastCollectedDate: null,
      startDate: new Date().toISOString().split("T")[0],
    };
    const id = await addCustomer(customerData);
    setCustomer(prev => [...prev, { ...customerData, id }]);
  }
  setBulkRows([]);
  setBulkStats(null);
  alert("Bulk customers added!");
}
};

  const handleClose = () => setShowModal(false);
  const handleExcelFileUpload = () => setShowExcelModal(true);

  //handle delete
  const handleDelete = async (index) => {
    const custToDelete = customer[index];
    await deleteCustomer(custToDelete.id);
    setCustomer(customer.filter((_, i) => i !== index));
  }


  const handleCollected = async (index) => {
    const today = new Date().toISOString().split("T")[0];
    const c = customer[index];
  
    // Already collected today → skip
    if (c.lastCollectedDate === today) return;
  
    // Use last collection date or start date
    const lastDate = c.lastCollectedDate || c.startDate;
    const lastDateObj = new Date(lastDate);
    const todayObj = new Date(today);
  
    // Calculate gap in days
    const diffTime = todayObj - lastDateObj;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const extraDue = diffDays > 1 ? (diffDays - 1) * c.deposit : 0;
  
    const updatedCustomer = {
      ...c,
      totalCollected: c.totalCollected + c.deposit + extraDue,
      due: 0, // ✅ reset after collecting
      lastCollectedDate: today,
      lastCollectedAmount: c.deposit + extraDue,
      // logs: [...(c.logs || []), {date:today, amount:c.lastCollectedAmount, due: c.due}],
    };
  
    await updateCustomer(c.id, updatedCustomer);
  
    setCustomer(prev =>
      prev.map((cust, i) => (i === index ? updatedCustomer : cust))
    );
  };
  


  //handle undo
  const handleUndo = async (index) => {
    const today = new Date().toISOString().split("T")[0];

    setCustomer(prev =>
      prev.map((c, i) => {
        if (i !== index) return c;
        if (c.lastCollectedDate !== today) return c; // only undo today

        const updatedCustomer = {
          ...c,
          totalCollected: Math.max(c.totalCollected - (c.lastCollectedAmount || c.deposit), 0),
          due: c.deposit,
          lastCollectedDate: null,
          lastCollectedAmount: 0,
        };

        // Persist to IndexedDB
        updateCustomer(updatedCustomer.id, updatedCustomer);

        return updatedCustomer;
      })
    );
  };


  // Handle updating deposit and frequency
  const handleDepositAmount = async (index, newDeposit, newFrequency) => {
    const updatedCustomer = {
      ...customer[index],
      deposit: parseFloat(newDeposit) || customer[index].deposit,
      frequency: newFrequency || customer[index].frequency,
      due: Math.max((parseFloat(newDeposit) || customer[index].deposit) - customer[index].totalCollected, 0),
    };
    await updateCustomer(updatedCustomer.id, updatedCustomer); //save to db
    setCustomer(prev => prev.map((c, i) => i === index ? updatedCustomer : c));
  };

  //toggle delete button
  const handleDeleteCustomerButton = () => {
    setShowDeleteButton(prev => !prev);
  }

  //handle excel file upload for bulk customer add
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const xlsx = await import('xlsx'); //dynamic import of xlsx for client
    const data = await file.arrayBuffer();
    const workbook = xlsx.read(data, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw = xlsx.utils.sheet_to_json(sheet, { defcal: '' }); //converts sheet into array of bojects

    // Normalize common header variants and basic cleaning i.e mapping similar headers to one
    const normalize = (r) => ({
      name: String(r.Name ?? r.name ?? r.FullName ?? r.fullname ?? r.Fullname ?? '').trim(),
      deposit: Number(r.Deposit ?? r.deposit ?? r.DepositAmount ?? r.deposite ?? r.Amount ?? r.amount ?? 0),
      frequency: String(r.Frequency ?? r.frequency ?? r.freq ?? r.Freq ?? '').trim(),
    })

    const rows = raw.map(normalize);
    setBulkRows(rows);
    setBulkStats({ total: rows.length });
  };



  return (
    
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 pb-10">
      <Navbar
        onAddCustomer={handleAddCustomer}
        onDeleteCustomer={handleDeleteCustomerButton} // this function needs to exist in Customers.js
        showDeleteButton={showDeleteButton}   // optional, for toggling "Delete"/"Done"
        onAddExcelFile={handleExcelFileUpload}
      />


{/* Delete All Customers Button */}
{/* this is just for temporary usage only delete it later */}
<button
  onClick={async () => {
    const userConfirmed = window.confirm("Are you sure you want to delete ALL customers?");
    if (!userConfirmed) return;

    const allCustomers = await getAllCustomers();
    for (const c of allCustomers) {
      await deleteCustomer(c.id);
    }
    setCustomer([]); // clear React state
    alert("All customers deleted!");
  }}
  className="mt-2 w-full bg-red-600 text-white font-medium py-2.5 rounded-lg shadow hover:bg-red-700 transition active:scale-95"
>
  🗑 Delete All Customers
</button>


      {/* Add Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={handleClose}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md transform transition-all scale-100 hover:scale-[1.02]">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Add New Customer</h2>
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold transition duration-150"
            >
              &times;
            </button>

            {/* Single Add Customer Form */}
            <div className="space-y-4 mt-2">
              <input
                placeholder="Full Name"
                value={newCustomer.name}
                required
                onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <input
                type="number"
                placeholder="Daily Deposit (₨)"
                value={newCustomer.deposit}
                onChange={(e) => setNewCustomer({ ...newCustomer, deposit: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <select
                value={newCustomer.frequency}
                onChange={(e) => setNewCustomer({ ...newCustomer, frequency: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="" disabled>
                  -- Select The Frequency --
                </option>
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            {/* Add Customer Button */}
            <button
              onClick={() => handleSubmit(false)}
              className="mt-6 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium py-2.5 rounded-lg shadow hover:from-blue-700 hover:to-blue-800 transform transition active:scale-95"
            >
              ➕ Add Customer
            </button>
          </div>
        </div>
      )}


      {/* Excel Upload Modal */}
      {showExcelModal && (
  <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
    {/* Background overlay */}
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={() => setShowExcelModal(false)}
    ></div>

    {/* Modal content */}
    <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-11/12 max-w-lg transform transition-all scale-100 hover:scale-[1.02]">
      {/* Header */}
      <h2 className="text-3xl font-bold mb-4 text-gray-900 border-b pb-2">Upload Excel / CSV</h2>

      {/* Close button */}
      <button
        onClick={() => setShowExcelModal(false)}
        className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-3xl font-bold transition duration-150"
      >
        &times;
      </button>

      {/* Instructions */}
      <p className="text-sm text-gray-600 mb-4">
        Required columns: <strong>Name, Deposit, Frequency</strong>
      </p>

      {/* File input */}
      <input
        type="file"
        accept=".xlsx,.xls,.csv"
        onChange={handleFileUpload}
        className="block w-full text-sm text-gray-900 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition"
      />

      {/* Bulk preview */}
      {bulkStats && (
        <div className="mt-6 text-gray-700">
          <div className="mb-3 font-medium text-gray-800">Total rows read: {bulkStats.total}</div>

          {bulkRows.length > 0 && (
            <div className="space-y-3">
              <div className="font-semibold">Preview (first 5 rows):</div>
              <div className="grid gap-2">
                {bulkRows.slice(0, 5).map((r, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg border border-gray-200 shadow-sm bg-gray-50 flex justify-between"
                  >
                    <span className="font-medium">{r.name || '(no name)'}</span>
                    <span>₨ {r.deposit || 0}</span>
                    <span>{r.frequency || '(no frequency)'}</span>
                  </div>
                ))}
              </div>

              {/* Add All Customers button */}
              <button
                onClick={() => {
                  handleSubmit(true);
                  setShowExcelModal(false);
                }}
                className="mt-4 w-full bg-green-600 text-white font-medium py-3 rounded-xl shadow hover:bg-green-700 transition active:scale-95"
              >
                ✅ Add All Customers
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  </div>
)}


      {/* Edit Modal */}
      {editModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 animate-fadeIn">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setEditModal(false)}></div>
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 w-11/12 max-w-md transform transition-all">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Edit Deposit & Frequency</h2>
            <button
              onClick={() => setEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600 text-2xl font-bold transition"
            >
              &times;
            </button>
            <div className="space-y-4 mt-2">
              <input
                type="number"
                placeholder="New Deposit Amount"
                value={editCustomerData.deposit}
                onChange={(e) =>
                  setEditCustomerData({ ...editCustomerData, deposit: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={editCustomerData.frequency}
                onChange={(e) =>
                  setEditCustomerData({ ...editCustomerData, frequency: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <button
              onClick={() => {
                handleDepositAmount(editCustomerIndex, editCustomerData.deposit, editCustomerData.frequency);
                setEditModal(false);
              }}
              className="mt-6 w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-medium py-2.5 rounded-lg shadow hover:from-green-600 hover:to-green-700 transition active:scale-95"
            >
              ✅ Save Changes
            </button>
          </div>
        </div>
      )}

      {/* confirmation modal */}
      {confirmIndex !== null && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <p className="text-lg font-semibold mb-4 text-black">
              पैसा लिनु भयो ? / Cash money collected?
            </p>
            <div className="flex justify-around">
              <button
                onClick={() => {
                  handleCollected(confirmIndex);
                  setConfirmIndex(null);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg"
              >
                Yes / लिएँ
              </button>
              <button
                onClick={() => setConfirmIndex(null)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                No / छैन
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customers Section */}
      <section id="customers" className="px-4 md:px-8 lg:px-12 mt-8">
        <h2 className="text-3xl font-bold text-blue-900 mb-6 flex items-center gap-2">
          👥 Customers
        </h2>

        {/* Search & Filter Row */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>
          <select 
          value={filterFrequency}
          onChange={(e) => setFilterFrequency(e.target.value)}
          className="md:w-48 px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition">
            <option value="All">All Frequencies</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </div>
      </section>

      {/* Customer Cards Grid */}
      <div className="px-4 md:px-8 lg:px-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3 mb-24">
        {customer.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(c => filterFrequency === 'All' || c.frequency === filterFrequency)
        .map((c, index) => (
          <div
            key={index}
            className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
          >
            {/* Header: Name & Delete */}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg md:text-xl font-semibold text-blue-900 truncate">{c.name}</h3>
              {showDeleteButton && (
                <button id="toggleDeleteButton"
                  onClick={() => handleDelete(index)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium px-2.5 py-1.5 rounded bg-red-50 hover:bg-red-100 transition"
                >
                  Delete
                </button>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-3 mb-5 text-sm md:text-base">
              <div>
                <strong className="text-gray-600">Deposit</strong>
                <p className="text-gray-800 font-medium">₨ {c.deposit}</p>
              </div>
              <div>
                <strong className="text-gray-600">Frequency</strong>
                <p className="text-gray-800 font-medium">{c.frequency}</p>
              </div>
              <div>
                <strong className="text-gray-600">Collected</strong>
                <p className="text-green-700 font-medium">₨ {c.totalCollected}</p>
              </div>
              <div>
                <strong className="text-gray-600">Due</strong>
                <p className={`font-medium ${c.due > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  ₨ {c.due}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              <button className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition">
                Visited
              </button>
              <button
                onClick={() => setConfirmIndex(index)}
                disabled={c.lastCollectedDate === new Date().toISOString().split("T")[0]}
                className={`px-3 py-1 rounded text-sm transition ${c.lastCollectedDate === new Date().toISOString().split("T")[0]
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
              >
                {
                  c.lastCollectedDate === new Date().toISOString().split("T")[0]
                    ? "Collected" : "Collect"
                }
              </button>
              <button
                onClick={() => {
                  setEditCustomerIndex(index);
                  setEditCustomerData({ deposit: c.deposit, frequency: c.frequency });
                  setEditModal(true);
                }}
                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition"
              >
                Edit
              </button>
              <button
                onClick={() => handleUndo(index)}
                className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-xs hover:bg-gray-300 transition"
              >
                Undo
              </button>              <button className="text-xs px-2 py-1 bg-gray-50 text-gray-500 rounded hover:bg-gray-100 transition">Log</button>
            </div>

            {/* Today's Collection Input */}
            <div className="flex flex-col sm:flex-row gap-2 items-center pt-3 border-t border-gray-100">
              <label className="text-xs text-gray-600 whitespace-nowrap">Amount Collected Today:</label>
              <div className="flex-1 flex gap-1">
                <input
                  type="number"
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="0"
                />
                <button className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition">
                  Submit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Customers;