import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to TaskHive
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Connect clients with talented freelancers
          </p>

          {user ? (
            <div className="space-x-4">
              <Link
                to="/jobs"
                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 inline-block"
              >
                Browse Jobs
              </Link>
              {user.role === 'client' && (
                <Link
                  to="/jobs/create"
                  className="bg-green-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-green-700 inline-block"
                >
                  Post a Job
                </Link>
              )}
            </div>
          ) : (
            <div className="space-x-4">
              <Link
                to="/register"
                className="bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-blue-700 inline-block"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="bg-white text-blue-600 px-6 py-3 rounded-md text-lg font-medium border-2 border-blue-600 hover:bg-blue-50 inline-block"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">For Clients</h2>
            <p className="text-gray-600">
              Post your projects and find the perfect freelancer to bring your ideas to life.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">For Freelancers</h2>
            <p className="text-gray-600">
              Browse available jobs, submit proposals, and grow your freelance career.
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-semibold mb-4">Real-time Communication</h2>
            <p className="text-gray-600">
              Chat with your clients or freelancers in real-time once a contract is created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
