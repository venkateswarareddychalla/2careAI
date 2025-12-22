import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { sharesAPI } from '../services/api';
import { Share2, Mail, User, AlertCircle, CheckCircle, Trash2, ArrowLeft } from 'lucide-react';

const ShareReport = () => {
    const { reportId } = useParams();
    const navigate = useNavigate();
    const [sharedWithEmail, setSharedWithEmail] = useState('');
    const [sharedWithName, setSharedWithName] = useState('');
    const [accessRole, setAccessRole] = useState('viewer');
    const [shares, setShares] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchShares();
    }, []);

    const fetchShares = async () => {
        try {
            const response = await sharesAPI.getSent();
            setShares(response.data.shares.filter(s => s.report_id === parseInt(reportId)));
        } catch (error) {
            console.error('Failed to fetch shares:', error);
        }
    };

    const handleShare = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            await sharesAPI.share({
                reportId: parseInt(reportId),
                sharedWithEmail,
                sharedWithName,
                accessRole
            });

            setSuccess('Report shared successfully!');
            setSharedWithEmail('');
            setSharedWithName('');
            fetchShares();
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to share report');
        } finally {
            setLoading(false);
        }
    };

    const handleRevoke = async (shareId) => {
        if (!confirm('Are you sure you want to revoke access?')) return;

        try {
            await sharesAPI.revoke(shareId);
            setShares(shares.filter(s => s.id !== shareId));
            setSuccess('Access revoked successfully');
        } catch (error) {
            setError('Failed to revoke access');
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto animate-fade-in">
                {/* Header */}
                <button
                    onClick={() => navigate('/reports')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Back to Reports
                </button>

                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Share Report</h1>
                    <p className="text-gray-600 mt-1">Grant access to family, friends, or doctors</p>
                </div>

                {/* Share Form */}
                <div className="card mb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Share2 className="w-6 h-6 text-indigo-600" />
                        Share with Someone
                    </h2>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 mt-0.5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4 flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 mt-0.5" />
                            <span>{success}</span>
                        </div>
                    )}

                    <form onSubmit={handleShare} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={sharedWithName}
                                    onChange={(e) => setSharedWithName(e.target.value)}
                                    className="input pl-10"
                                    placeholder="Dr. John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Recipient Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="email"
                                    value={sharedWithEmail}
                                    onChange={(e) => setSharedWithEmail(e.target.value)}
                                    className="input pl-10"
                                    placeholder="doctor@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Access Level
                            </label>
                            <select
                                value={accessRole}
                                onChange={(e) => setAccessRole(e.target.value)}
                                className="input"
                            >
                                <option value="viewer">Viewer (Read Only)</option>
                                <option value="editor">Editor (Can Modify)</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1">
                                Viewers can only read the report. Editors can modify it.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Sharing...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Share2 className="w-5 h-5" />
                                    Share Report
                                </span>
                            )}
                        </button>
                    </form>
                </div>

                {/* Current Shares */}
                <div className="card">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Currently Shared With
                    </h2>

                    {shares.length > 0 ? (
                        <div className="space-y-3">
                            {shares.map((share) => (
                                <div
                                    key={share.id}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-4"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                            <User className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-medium text-gray-900 truncate">{share.shared_with_name}</p>
                                            <p className="text-sm text-gray-600 truncate">{share.shared_with_email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 self-end sm:self-auto">
                                        <span className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 capitalize">
                                            {share.access_role}
                                        </span>
                                        <button
                                            onClick={() => handleRevoke(share.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Revoke access"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-gray-500">
                            <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>This report hasn't been shared with anyone yet</p>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default ShareReport;
