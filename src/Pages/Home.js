import React from 'react';
export default function Home() {

  return (
    <div className="font-sans min-h-screen bg-blue-50 flex flex-col justify-between">

      {/* Main Dashboard */}
      <main className="flex flex-col gap-8 p-6 items-center w-full">
        <h2 className="text-3xl font-semibold text-blue-900 mb-4">Dashboard</h2>
        <div className="grid md:grid-cols-3 gap-6 w-full max-w-5xl">

          {/* Total Collected Today */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-700 text-white shadow-lg rounded p-6 flex flex-col items-center">
            <div className="text-4xl mb-2 font-bold">💰</div>
            <p className="text-gray-100">Total Collected Today</p>
            <p className="text-3xl font-bold mt-2">₨ 5,000</p>
          </div>

          {/* Total Customers */}
          <div className="bg-gradient-to-r from-gray-800 to-black text-white shadow-lg rounded p-6 flex flex-col items-center">
            <div className="text-4xl mb-2 font-bold">👥</div>
            <p className="text-gray-300">Total Customers</p>
            <p className="text-3xl font-bold mt-2">3</p>
          </div>

          {/* Total Due */}
          <div className="bg-gradient-to-r from-red-600 to-red-800 text-white shadow-lg rounded p-6 flex flex-col items-center">
            <div className="text-4xl mb-2 font-bold">⚠️</div>
            <p className="text-gray-200">Total Due</p>
            <p className="text-3xl font-bold mt-2">₨ 1,500</p>
          </div>

        </div>
      </main>
    </div>
  );
}
