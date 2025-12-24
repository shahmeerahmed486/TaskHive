import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { proposalsApi } from '../api/proposals';
import { jobsApi } from '../api/jobs';
import { Proposal, Job } from '../types';

const ProposalsList: React.FC = () => {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [jobs, setJobs] = useState<Record<number, Job>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProposals();
  }, []);

  const loadProposals = async () => {
    setLoading(true);
    setError('');
    try {
      const proposalsData = await proposalsApi.getMyProposals();
      setProposals(proposalsData);

      // Load job details for each proposal
      const jobsData = await jobsApi.getJobs({ limit: 100 });
      const jobsMap: Record<number, Job> = {};
      proposalsData.forEach((proposal) => {
        const job = jobsData.find((j) => j.id === proposal.job_id);
        if (job) {
          jobsMap[proposal.job_id] = job;
        }
      });
      setJobs(jobsMap);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load proposals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Proposals</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading proposals...</div>
      ) : proposals.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="mb-4">You haven't submitted any proposals yet.</p>
          <Link
            to="/jobs"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Browse Jobs →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {proposals.map((proposal) => {
            const job = jobs[proposal.job_id];
            return (
              <div
                key={proposal.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {job ? (
                        <Link
                          to={`/jobs/${job.id}`}
                          className="hover:text-blue-600"
                        >
                          {job.title}
                        </Link>
                      ) : (
                        `Job #${proposal.job_id}`
                      )}
                    </h3>
                    {proposal.cover_letter && (
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {proposal.cover_letter}
                      </p>
                    )}
                    <div className="flex items-center space-x-4">
                      <div>
                        <span className="text-sm text-gray-500">Bid Amount:</span>
                        <span className="ml-2 text-lg font-bold text-blue-600">
                          ${proposal.bid_amount.toLocaleString()}
                        </span>
                      </div>
                      {job && (
                        <div>
                          <span className="text-sm text-gray-500">Job Budget:</span>
                          <span className="ml-2 text-gray-700">
                            ${job.budget.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4">
                    {job && (
                      <Link
                        to={`/jobs/${job.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        View Job
                      </Link>
                    )}
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

export default ProposalsList;
