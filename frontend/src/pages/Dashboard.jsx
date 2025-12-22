import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { reportsAPI, vitalsAPI } from '../services/api';
import {
    Upload,
    FileText,
    Activity,
    TrendingUp,
    Calendar,
    Heart,
    Droplet,
    Thermometer
} from 'lucide-react';

const Dashboard = () => {
    const [stats, setStats] = useState({ reports: 0, vitals: 0 });
    const [recentReports, setRecentReports] = useState([]);
    const [vitalsSummary, setVitalsSummary] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [reportsRes, summaryRes] = await Promise.all([
                reportsAPI.getAll(),
                vitalsAPI.getSummary()
            ]);

            setRecentReports(reportsRes.data.reports.slice(0, 5));
            setVitalsSummary(summaryRes.data.summary);
            setStats({
                reports: reportsRes.data.reports.length,
                vitals: summaryRes.data.summary.length
            });
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const getVitalIcon = (type) => {
        const icons = {
            'Blood Pressure': Heart,
            'Heart Rate': Activity,
            'Blood Sugar': Droplet,
            'Temperature': Thermometer,
        };
        return icons[type] || Activity;
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
                {/* Welcome Section */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600 mt-1">Welcome to your Digital Health Wallet</p>
                </div>

                {/* Quick Stats - Now 4 columns to match Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-indigo-100 text-sm">Total Reports</p>
                                <p className="text-4xl font-bold mt-2">{stats.reports}</p>
                            </div>
                            <FileText className="w-12 h-12 text-indigo-200" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-pink-500 to-pink-600 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-pink-100 text-sm">Vitals Tracked</p>
                                <p className="text-4xl font-bold mt-2">{stats.vitals}</p>
                            </div>
                            <Activity className="w-12 h-12 text-pink-200" />
                        </div>
                    </div>

                    <Link to="/upload" className="card bg-gradient-to-br from-green-500 to-green-600 text-white hover:shadow-lg transition-all cursor-pointer active:scale-95">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-sm">Upload Report</p>
                                <p className="text-lg font-medium mt-2">Add new health data</p>
                            </div>
                            <Upload className="w-12 h-12 text-green-200" />
                        </div>
                    </Link>

                    <Link to="/vitals" className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white hover:shadow-lg transition-all cursor-pointer active:scale-95">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-sm">Track Vitals</p>
                                <p className="text-lg font-medium mt-2">View trends</p>
                            </div>
                            <TrendingUp className="w-12 h-12 text-purple-200" />
                        </div>
                    </Link>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Reports */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Recent Reports</h2>
                            <Link to="/reports" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                View All
                            </Link>
                        </div>

                        {recentReports.length > 0 ? (
                            <div className="space-y-3">
                                {recentReports.map((report) => (
                                    <Link
                                        key={report.id}
                                        to={`/reports/${report.id}`}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <FileText className="w-5 h-5 text-indigo-600" />
                                            <div>
                                                <p className="font-medium text-gray-900">{report.report_type}</p>
                                                <p className="text-sm text-gray-500">{report.original_name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <Calendar className="w-4 h-4" />
                                            <span className="text-sm">{new Date(report.report_date).toLocaleDateString()}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No reports yet</p>
                                <Link to="/upload" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block">
                                    Upload your first report
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Vitals Summary */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Latest Vitals</h2>
                            <Link to="/vitals" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                                View Trends
                            </Link>
                        </div>

                        {vitalsSummary.length > 0 ? (
                            <div className="space-y-3">
                                {vitalsSummary.map((vital, index) => {
                                    const Icon = getVitalIcon(vital.vital_type);
                                    return (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <Icon className="w-5 h-5 text-pink-600" />
                                                <div>
                                                    <p className="font-medium text-gray-900">{vital.vital_type}</p>
                                                    <p className="text-sm text-gray-500">{new Date(vital.recorded_date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-lg font-semibold text-gray-900">
                                                {vital.vital_value} {vital.unit}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No vitals data yet</p>
                                <p className="text-sm mt-1">Upload a report with vitals to see data here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;
