import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { reportsAPI } from '../services/api';
import { Upload, FileText, Calendar, Heart, Droplet, Activity, Thermometer, X, CheckCircle } from 'lucide-react';

const UploadReport = () => {
    const [file, setFile] = useState(null);
    const [reportType, setReportType] = useState('');
    const [reportDate, setReportDate] = useState('');
    const [vitals, setVitals] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [dragActive, setDragActive] = useState(false);
    const navigate = useNavigate();

    const reportTypes = [
        'Blood Test',
        'X-Ray',
        'MRI Scan',
        'CT Scan',
        'Ultrasound',
        'ECG',
        'Prescription',
        'Consultation Report',
        'Other'
    ];

    const vitalTypes = [
        { name: 'Blood Pressure', icon: Heart, unit: 'mmHg' },
        { name: 'Heart Rate', icon: Activity, unit: 'bpm' },
        { name: 'Blood Sugar', icon: Droplet, unit: 'mg/dL' },
        { name: 'Temperature', icon: Thermometer, unit: '°F' },
    ];

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileChange(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (selectedFile) => {
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

        if (!allowedTypes.includes(selectedFile.type)) {
            setError('Invalid file type. Only PDF and images are allowed.');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setError('');
    };

    const addVital = (type, unit) => {
        if (!vitals.find(v => v.type === type)) {
            setVitals([...vitals, { type, value: '', unit }]);
        }
    };

    const updateVital = (type, value) => {
        setVitals(vitals.map(v => v.type === type ? { ...v, value } : v));
    };

    const removeVital = (type) => {
        setVitals(vitals.filter(v => v.type !== type));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!file || !reportType || !reportDate) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('reportType', reportType);
            formData.append('reportDate', reportDate);
            formData.append('vitals', JSON.stringify(vitals.filter(v => v.value)));

            await reportsAPI.upload(formData);
            navigate('/reports');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to upload report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto animate-fade-in">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Upload Report</h1>
                    <p className="text-gray-600 mt-1">Add a new health report to your wallet</p>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* File Upload */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Document File</h3>

                        <div
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                            className={`border-2 border-dashed rounded-xl p-4 sm:p-8 text-center transition-all ${dragActive
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-300 hover:border-gray-400'
                                }`}
                        >
                            {file ? (
                                <div className="space-y-4">
                                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                                    <div>
                                        <p className="font-medium text-gray-900 break-all">{file.name}</p>
                                        <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setFile(null)}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <Upload className="w-16 h-16 text-gray-400 mx-auto" />
                                    <div>
                                        <label className="cursor-pointer">
                                            <span className="text-indigo-600 hover:text-indigo-700 font-medium">
                                                Click to upload
                                            </span>
                                            <span className="text-gray-600"> or drag and drop</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleFileChange(e.target.files[0])}
                                            />
                                        </label>
                                        <p className="text-sm text-gray-500 mt-1">PDF or Image (max 10MB)</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Report Details */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Details</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report Type *
                                </label>
                                <select
                                    value={reportType}
                                    onChange={(e) => setReportType(e.target.value)}
                                    className="input"
                                    required
                                >
                                    <option value="">Select type</option>
                                    {reportTypes.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Report Date *
                                </label>
                                <input
                                    type="date"
                                    value={reportDate}
                                    onChange={(e) => setReportDate(e.target.value)}
                                    className="input"
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Vitals */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Associated Vitals (Optional)</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                            {vitalTypes.map((vital) => {
                                const Icon = vital.icon;
                                const added = vitals.find(v => v.type === vital.name);
                                return (
                                    <button
                                        key={vital.name}
                                        type="button"
                                        onClick={() => addVital(vital.name, vital.unit)}
                                        disabled={added}
                                        className={`p-3 rounded-lg border-2 transition-all ${added
                                            ? 'border-indigo-500 bg-indigo-50 cursor-not-allowed'
                                            : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                    >
                                        <Icon className={`w-6 h-6 mx-auto mb-2 ${added ? 'text-indigo-600' : 'text-gray-400'}`} />
                                        <p className="text-xs text-gray-700 font-medium text-center">{vital.name}</p>
                                    </button>
                                );
                            })}
                        </div>

                        {vitals.length > 0 && (
                            <div className="space-y-3">
                                {vitals.map((vital) => (
                                    <div key={vital.type} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                                        <div className="flex-1">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                {vital.type}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={vital.value}
                                                    onChange={(e) => updateVital(vital.type, e.target.value)}
                                                    placeholder="Enter value"
                                                    className="input"
                                                />
                                                <span className="text-sm text-gray-600 min-w-[60px]">{vital.unit}</span>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVital(vital.type)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col-reverse sm:flex-row gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/reports')}
                            className="btn btn-secondary px-8 py-3 w-full sm:w-auto"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 btn btn-primary py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Uploading...
                                </span>
                            ) : (
                                'Upload Report'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </Layout>
    );
};

export default UploadReport;
