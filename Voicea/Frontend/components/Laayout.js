"use client";

import React from "react";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-indigo-400 to-purple-500 p-6">
      <div className="w-full max-w-4xl bg-white p-6 rounded-lg shadow-xl">
        {children}
      </div>
    </div>
  );
};

export default Layout;
