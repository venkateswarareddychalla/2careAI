import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { sharesAPI } from '../services/api';
import { FileText, User, Calendar, Shield } from 'lucide-react';

const SharedReports = () => {
    const [receivedShares, setReceivedShares] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSharedReports();
    }, []);

    const fetchSharedReports = async () => {
        try {
            const response = await sharesAPI.getReceived();
            setReceivedShares(response.data.shares);
        } catch (error) {
            console.error('Failed to fetch shared reports:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex items-center justify-center h-64">
                    <div className="spinner"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="animate-fade-in space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Shared Reports</h1>
                    <p className="text-gray-600 mt-1">
                        Reports that have been shared with you
                    </p>
                </div>

                {/* Shared Reports List */}
                {receivedShares.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {receivedShares.map((share) => (
                            <div key={share.id} className="card hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                                                {share.report_type}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1 truncate">{share.original_name}</p>

                                            <div className="flex flex-wrap items-center gap-4 mt-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <User className="w-4 h-4" />
                                                    <span className="truncate">From: {share.owner_name}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(share.report_date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Shield className="w-4 h-4 text-indigo-600" />
                                                    <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium">
                                                        {share.access_role}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 pt-4 sm:pt-0 border-t border-gray-100 sm:border-0 justify-between sm:justify-start">
                                        <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm text-center">
                                            Shared Report
                                        </span>
                                        <span className="text-xs text-gray-500 text-center">
                                            {share.file_type.includes('pdf') ? 'PDF' : 'Image'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-16">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No shared reports
                        </h3>
                        <p className="text-gray-600">
                            Reports shared with you will appear here
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SharedReports;
