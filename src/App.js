// src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./Components/Header"; // your extracted Header
import Navbar from "./Components/Navbar";
import ServiceWorkerRegister from "./Components/ServiceWorkerRegister";
import Home from "./Pages/Home";
import Customer from "./Pages/Customer";
import Export from "./Pages/Export";
import "./App.css";

function App() {
  return (
    <Router>
      {/* Register Service Worker */}
      <ServiceWorkerRegister />

      {/* Header */}
      <Header />

      {/* Navbar */}
      <Navbar />

      {/* Pages */}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/customer" element={<Customer />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App;
