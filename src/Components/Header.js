import React from "react";

const Header = () => {
  return (
    <header className="bg-blue-900 text-white p-5 shadow flex items-center justify-between gap-3">
      <div className="flex items-center gap-5 md:flex">
        <div className="w-12 h-12 md:h-14 md:w-14 bg-white rounded-full flex items-center justify-center text-blue-900 font-bold text-lg">
          G
        </div>
        <span className="text-xl font-bold md:text-2xl">Gurudev Bachat Sahakari</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 md:h-7 md:w-7 bg-white rounded-full flex items-center justify-center text-blue-900 font-semibold">
          M
        </div>
        <span className="text-white">Mom</span>
      </div>
    </header>
  );
};

export default Header;
