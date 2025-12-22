import React from "react";
import { useAuth } from "../contexts/AuthContext";
import NotificationBell from "../components/navbar/NotificationBell";

const Navbar: React.FC = () => {
  const { user } = useAuth();

  return (
    <nav className=" bg-white px-4 py-1 border-b-2">
      <div className="flex items-center justify-end max-w-8xl mx-auto">

        <div className="flex items-center">
          {user && (
            <NotificationBell userId={user.id} userRole={user.role} />
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
