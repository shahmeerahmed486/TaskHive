import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contractsApi } from '../api/contracts';
import { jobsApi } from '../api/jobs';
import { authApi } from '../api/auth';
import { Contract, Job, User } from '../types';
import { useAuth } from '../context/AuthContext';

const ContractsList: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [jobs, setJobs] = useState<Record<number, Job>>({});
  const [users, setUsers] = useState<Record<number, User>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    setLoading(true);
    setError('');
    try {
      const contractsData = await contractsApi.getMyContracts();
      setContracts(contractsData);

      // Load job details and user details
      // Fetch jobs with max limit (100) - if we need more, we'd need pagination
      const jobsData = await jobsApi.getJobs({ limit: 100 });
      const jobsMap: Record<number, Job> = {};
      const userIds = new Set<number>();

      contractsData.forEach((contract) => {
        const job = jobsData.find((j) => j.id === contract.job_id);
        if (job) {
          jobsMap[contract.job_id] = job;
        }
        userIds.add(contract.client_id);
        userIds.add(contract.freelancer_id);
      });
      setJobs(jobsMap);

      // Load user details
      const allUsers = await authApi.getUsers();
      const usersMap: Record<number, User> = {};
      allUsers.forEach((u) => {
        if (userIds.has(u.id)) {
          usersMap[u.id] = u;
        }
      });
      setUsers(usersMap);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load contracts');
    } finally {
      setLoading(false);
    }
  };

  const getOtherUser = (contract: Contract): User | undefined => {
    if (user?.id === contract.client_id) {
      return users[contract.freelancer_id];
    } else if (user?.id === contract.freelancer_id) {
      return users[contract.client_id];
    }
    return undefined;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Contracts</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">You don't have any contracts yet.</p>
          {user?.role === 'client' && (
            <Link
              to="/jobs"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse Jobs →
            </Link>
          )}
          {user?.role === 'freelancer' && (
            <Link
              to="/jobs"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Submit Proposals →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {contracts.map((contract) => {
            const job = jobs[contract.job_id];
            const otherUser = getOtherUser(contract);
            return (
              <div
                key={contract.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {job ? (
                          <Link
                            to={`/jobs/${job.id}`}
                            className="hover:text-blue-600"
                          >
                            {job.title}
                          </Link>
                        ) : (
                          `Contract #${contract.id}`
                        )}
                      </h3>
                      <span
                        className={`px-3 py-1 text-sm rounded ${contract.status === 'ongoing'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                          }`}
                      >
                        {contract.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <span className="text-sm text-gray-500">Amount:</span>
                        <div className="text-lg font-bold text-blue-600">
                          ${contract.amount.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Created:</span>
                        <div className="text-gray-700">
                          {new Date(contract.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {otherUser && (
                      <div className="mb-4">
                        <span className="text-sm text-gray-500">
                          {user?.id === contract.client_id ? 'Freelancer' : 'Client'}:
                        </span>
                        <div className="text-gray-700">{otherUser.name} ({otherUser.email})</div>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <Link
                      to={`/contracts/${contract.id}`}
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 inline-block"
                    >
                      Open Chat
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContractsList;
