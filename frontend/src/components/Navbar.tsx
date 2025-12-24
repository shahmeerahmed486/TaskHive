import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              TaskHive
            </Link>
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/jobs"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Jobs
              </Link>
              {user?.role === 'client' && (
                <Link
                  to="/jobs/create"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Post Job
                </Link>
              )}
              {user?.role === 'freelancer' && (
                <Link
                  to="/proposals"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  My Proposals
                </Link>
              )}
              <Link
                to="/contracts"
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
              >
                Contracts
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-sm">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-blue-700 rounded-md text-sm font-medium hover:bg-blue-800"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
