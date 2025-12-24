import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/jobs';
import { proposalsApi } from '../api/proposals';
import { contractsApi } from '../api/contracts';
import { Job, Proposal, ProposalCreate } from '../types';
import { useAuth } from '../context/AuthContext';

const JobDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposalForm, setProposalForm] = useState<ProposalCreate>({
    bid_amount: 0,
    cover_letter: '',
  });
  const [submittingProposal, setSubmittingProposal] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      loadJob();
      loadProposals();
    }
  }, [id]);

  const loadJob = async () => {
    try {
      const jobs = await jobsApi.getJobs({ limit: 100 });
      const foundJob = jobs.find((j) => j.id === parseInt(id!));
      if (foundJob) {
        setJob(foundJob);
      } else {
        setError('Job not found');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load job');
    } finally {
      setLoading(false);
    }
  };

  const loadProposals = async () => {
    try {
      const data = await proposalsApi.getJobProposals(parseInt(id!));
      setProposals(data);
    } catch (err: any) {
      console.error('Failed to load proposals:', err);
    }
  };

  const handleDeleteJob = async () => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;

    try {
      await jobsApi.deleteJob(parseInt(id!));
      navigate('/jobs');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to delete job');
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingProposal(true);
    try {
      await proposalsApi.createProposal(parseInt(id!), proposalForm);
      setShowProposalForm(false);
      setProposalForm({ bid_amount: 0, cover_letter: '' });
      loadProposals();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit proposal');
    } finally {
      setSubmittingProposal(false);
    }
  };

  const handleAcceptProposal = async (proposalId: number) => {
    if (!window.confirm('Accept this proposal and create a contract?')) return;

    try {
      const contract = await contractsApi.acceptProposal(proposalId);
      navigate(`/contracts/${contract.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to accept proposal');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-red-600">Job not found</div>
      </div>
    );
  }

  const isOwner = user?.id === job.client_id;
  const canSubmitProposal = user?.role === 'freelancer' && job.status === 'open';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/jobs" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to Jobs
      </Link>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
            <span
              className={`inline-block px-3 py-1 text-sm rounded ${
                job.status === 'open'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {job.status}
            </span>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              ${job.budget.toLocaleString()}
            </div>
            {isOwner && (
              <div className="mt-2 space-x-2">
                <Link
                  to={`/jobs/${job.id}/edit`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit
                </Link>
                <button
                  onClick={handleDeleteJob}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-700 whitespace-pre-wrap">
            {job.description || 'No description provided'}
          </p>
        </div>
      </div>

      {canSubmitProposal && !showProposalForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <button
            onClick={() => setShowProposalForm(true)}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Submit Proposal
          </button>
        </div>
      )}

      {showProposalForm && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Submit Proposal</h2>
          <form onSubmit={handleSubmitProposal}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bid Amount ($)
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  value={proposalForm.bid_amount || ''}
                  onChange={(e) =>
                    setProposalForm({
                      ...proposalForm,
                      bid_amount: parseInt(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cover Letter
                </label>
                <textarea
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500"
                  value={proposalForm.cover_letter}
                  onChange={(e) =>
                    setProposalForm({ ...proposalForm, cover_letter: e.target.value })
                  }
                  placeholder="Tell the client why you're the right person for this job..."
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                type="submit"
                disabled={submittingProposal}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {submittingProposal ? 'Submitting...' : 'Submit Proposal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowProposalForm(false);
                  setProposalForm({ bid_amount: 0, cover_letter: '' });
                }}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {isOwner && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Proposals ({proposals.length})</h2>
          {proposals.length === 0 ? (
            <p className="text-gray-500">No proposals yet</p>
          ) : (
            <div className="space-y-4">
              {proposals.map((proposal) => (
                <div key={proposal.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-lg">
                        ${proposal.bid_amount.toLocaleString()}
                      </div>
                      {proposal.cover_letter && (
                        <p className="text-gray-700 mt-2">{proposal.cover_letter}</p>
                      )}
                    </div>
                    {job.status === 'open' && (
                      <button
                        onClick={() => handleAcceptProposal(proposal.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      >
                        Accept Proposal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default JobDetail;
