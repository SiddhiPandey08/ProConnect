import React from "react";
import NavbarComponent from "@/Components/Navbar";

export default function UserLayout({ children }) {
  return (
    <div>
      <NavbarComponent />
      {children}
    </div>
  );
}
