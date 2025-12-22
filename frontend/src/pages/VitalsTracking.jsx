import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { vitalsAPI } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Droplet, Thermometer, TrendingUp, Calendar } from 'lucide-react';

const VitalsTracking = () => {
    const [trends, setTrends] = useState({});
    const [summary, setSummary] = useState([]);
    const [selectedVital, setSelectedVital] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(true);

    const vitalTypes = [
        { name: 'Blood Pressure', icon: Heart, color: '#ef4444' },
        { name: 'Heart Rate', icon: Activity, color: '#6366f1' },
        { name: 'Blood Sugar', icon: Droplet, color: '#ec4899' },
        { name: 'Temperature', icon: Thermometer, color: '#f59e0b' },
    ];

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (selectedVital || startDate || endDate) {
            fetchTrends();
        }
    }, [selectedVital, startDate, endDate]);

    const fetchData = async () => {
        try {
            const [trendsRes, summaryRes] = await Promise.all([
                vitalsAPI.getTrends(),
                vitalsAPI.getSummary()
            ]);
            setTrends(trendsRes.data.trends);
            setSummary(summaryRes.data.summary);

            // Set default vital
            const firstVital = Object.keys(trendsRes.data.trends)[0];
            if (firstVital) setSelectedVital(firstVital);
        } catch (error) {
            console.error('Failed to fetch vitals:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTrends = async () => {
        try {
            const params = {};
            if (selectedVital) params.vitalType = selectedVital;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await vitalsAPI.getTrends(params);
            setTrends(response.data.trends);
        } catch (error) {
            console.error('Failed to fetch trends:', error);
        }
    };

    const getVitalIcon = (type) => {
        const vital = vitalTypes.find(v => v.name === type);
        return vital ? vital.icon : Activity;
    };

    const getVitalColor = (type) => {
        const vital = vitalTypes.find(v => v.name === type);
        return vital ? vital.color : '#6366f1';
    };

    const formatChartData = () => {
        if (!selectedVital || !trends[selectedVital]) return [];

        return trends[selectedVital].map(item => ({
            date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: item.value,
        }));
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

    const chartData = formatChartData();

    return (
        <Layout>
            <div className="animate-fade-in space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Vitals Tracking</h1>
                    <p className="text-gray-600 mt-1">Monitor your health metrics over time</p>
                </div>

                {/* Latest Vitals Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {vitalTypes.map((vital) => {
                        const Icon = vital.icon;
                        const latestValue = summary.find(s => s.vital_type === vital.name);

                        return (
                            <div
                                key={vital.name}
                                className={`card cursor-pointer transition-all ${selectedVital === vital.name
                                        ? 'ring-2 ring-indigo-500 shadow-md'
                                        : 'hover:shadow-md'
                                    }`}
                                onClick={() => setSelectedVital(vital.name)}
                                style={{ borderTopColor: vital.color, borderTopWidth: '4px' }}
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-gray-600 mb-1">{vital.name}</p>
                                        {latestValue ? (
                                            <>
                                                <p className="text-2xl font-bold text-gray-900">
                                                    {latestValue.vital_value}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {latestValue.unit}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-gray-400">No data</p>
                                        )}
                                    </div>
                                    <Icon className="w-10 h-10" style={{ color: vital.color }} />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Filters */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Trend Analysis
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Vital Type
                            </label>
                            <select
                                value={selectedVital}
                                onChange={(e) => setSelectedVital(e.target.value)}
                                className="input"
                            >
                                <option value="">Select vital</option>
                                {Object.keys(trends).map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>

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

                {/* Chart */}
                {chartData.length > 0 ? (
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-6">
                            {selectedVital} Trends
                        </h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <YAxis
                                        stroke="#6b7280"
                                        style={{ fontSize: '12px' }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#fff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            padding: '8px 12px',
                                        }}
                                    />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="value"
                                        stroke={getVitalColor(selectedVital)}
                                        strokeWidth={3}
                                        dot={{ fill: getVitalColor(selectedVital), r: 5 }}
                                        activeDot={{ r: 7 }}
                                        name={selectedVital}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="card text-center py-16">
                        <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No vitals data</h3>
                        <p className="text-gray-600">
                            {selectedVital
                                ? `No data available for ${selectedVital}`
                                : 'Select a vital type to view trends'}
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default VitalsTracking;
