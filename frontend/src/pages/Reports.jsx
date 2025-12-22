import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { reportsAPI } from '../services/api';
import { FileText, Download, Trash2, Share2, Search, Filter, Calendar, X } from 'lucide-react';

const Reports = () => {
    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        filterReports();
    }, [reports, searchTerm, selectedType, startDate, endDate]);

    const fetchReports = async () => {
        try {
            const response = await reportsAPI.getAll();
            setReports(response.data.reports);
            setFilteredReports(response.data.reports);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterReports = () => {
        let filtered = [...reports];

        if (searchTerm) {
            filtered = filtered.filter(r =>
                r.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                r.report_type.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedType) {
            filtered = filtered.filter(r => r.report_type === selectedType);
        }

        if (startDate && endDate) {
            filtered = filtered.filter(r => {
                const reportDate = new Date(r.report_date);
                return reportDate >= new Date(startDate) && reportDate <= new Date(endDate);
            });
        }

        setFilteredReports(filtered);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this report?')) return;

        try {
            await reportsAPI.delete(id);
            setReports(reports.filter(r => r.id !== id));
        } catch (error) {
            alert('Failed to delete report');
        }
    };

    const handleDownload = async (id, filename) => {
        try {
            const response = await reportsAPI.download(id);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download report');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedType('');
        setStartDate('');
        setEndDate('');
    };

    const reportTypes = [...new Set(reports.map(r => r.report_type))];

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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Reports</h1>
                        <p className="text-gray-600 mt-1">{filteredReports.length} report(s) found</p>
                    </div>
                    <Link to="/upload" className="btn btn-primary">
                        <FileText className="w-5 h-5 inline mr-2" />
                        Upload New Report
                    </Link>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="sm:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                                <input
                                    type="text"
                                    placeholder="Search reports..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="input pl-14 w-full"
                                />
                            </div>
                        </div>

                        <div>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="input w-full"
                            >
                                <option value="">All Types</option>
                                {reportTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={clearFilters}
                                className="btn btn-secondary flex items-center justify-center gap-2 w-full"
                            >
                                <X className="w-4 h-4" />
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>
                </div>

                {/* Reports List */}
                {filteredReports.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredReports.map((report) => (
                            <div key={report.id} className="card hover:shadow-md transition-all">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4 flex-1">
                                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                            <FileText className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-gray-900 text-lg truncate">
                                                {report.report_type}
                                            </h3>
                                            <p className="text-sm text-gray-600 mt-1 truncate">{report.original_name}</p>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" />
                                                    <span>{new Date(report.report_date).toLocaleDateString()}</span>
                                                </div>
                                                <span>{(report.file_size / 1024).toFixed(2)} KB</span>
                                                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                                                    {report.file_type.includes('pdf') ? 'PDF' : 'Image'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 sm:pt-0 sm:border-0 border-t border-gray-100 justify-end sm:justify-start">
                                        <button
                                            onClick={() => handleDownload(report.id, report.original_name)}
                                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                            title="Download"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                        <Link
                                            to={`/reports/${report.id}/share`}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Share"
                                        >
                                            <Share2 className="w-5 h-5" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(report.id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-16">
                        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                        <p className="text-gray-600 mb-6">
                            {reports.length === 0
                                ? "You haven't uploaded any reports yet"
                                : 'Try adjusting your filters'}
                        </p>
                        {reports.length === 0 && (
                            <Link to="/upload" className="btn btn-primary inline-flex items-center gap-2">
                                <FileText className="w-5 h-5" />
                                Upload Your First Report
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Reports;
