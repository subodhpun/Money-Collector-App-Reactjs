import React from 'react'
import { Link } from 'react-router-dom';

const Navbar = ({onAddCustomer, onDeleteCustomer, showDeleteButton  = false, onAddExcelFile}) => {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t shadow grid grid-rows-2 p-3 gap-2 md:flex md:justify-around z-50">

      {/* Row 1: 3 buttons */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <Link to="/">
          <button className="px-3 py-2 rounded bg-blue-700 text-white text-center w-full cursor-pointer">
            Dashboard
          </button>
        </Link>
        <Link to="/customer">
          <button className="px-3 py-2 rounded bg-blue-700 text-white text-center w-full cursor-pointer">
            Customers
          </button>
        </Link>
        <Link to="/export">
          <button className="px-3 py-2 rounded bg-blue-700 text-white text-center w-full cursor-pointer">
            Export
          </button>
        </Link>
      </div>

      {/* Row 2: 2 buttons */}
      <div className="grid grid-cols-3 gap-2 md:gap-4">
        <button id="deleteButtonFromNavbar" className="px-3 py-2 rounded bg-gray-200 text-gray-900 text-center w-full cursor-pointer"
        onClick={onAddCustomer}>
          Add Customer
        </button>

        <button id="deleteButtonFromNavbar" className="px-3 py-2 rounded bg-gray-200 text-gray-900 text-center w-full cursor-pointer"
        onClick={onAddExcelFile}>
          Add Excel File
        </button>

        <button className="px-3 py-2 rounded bg-black text-white text-center w-full cursor-pointer"
        onClick={onDeleteCustomer}>
          {showDeleteButton ? 'Done': 'Delete Customers'}
        </button>
      </div>

    </nav>
  )
}

export default Navbar
