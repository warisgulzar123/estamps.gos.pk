import React, { useState } from 'react';
import axios from 'axios';
import { QRCodeCanvas } from 'qrcode.react';
import DenseQRCode from './DenseQRCode';
import {
    ShieldCheck,
    QrCode,
    Save,
    Download,
    CheckCircle,
    AlertCircle,
    FileText,
    Building2,
    User,
    CreditCard,
    Calendar,
    DollarSign,
    FileSpreadsheet,
    X,
    Sparkles,
    LogOut
} from 'lucide-react';
import QRScanner from './QRScanner';

const EStampPortal = ({ onLogout }) => {
    const [bankLabel, setBankLabel] = useState('BANK');
    const [borrowerLabel, setBorrowerLabel] = useState('BORROWER');

    const [formData, setFormData] = useState({
        _id: '',
        description: '',
        bank: '',
        bankLabel: 'BANK',
        borrower: '',
        borrowerLabel: 'BORROWER',
        stampDutyPaidBy: '',
        stampIssueDate: '',
        paidThroughChallan: '',
        totalAmount: '',
        amountInWords: ''
    });

    const [showScanner, setShowScanner] = useState(false);
    const [savedData, setSavedData] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // Handle Input Changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Safe handler for extracted data from QR Scanner
    const handleDataExtracted = (extractedData) => {
        if (!extractedData) return;

        try {
            let dataObj = extractedData;

            // In case extractedData is raw string
            if (typeof extractedData === 'string') {
                try {
                    dataObj = JSON.parse(extractedData);
                } catch (e) {
                    dataObj = { description: extractedData };
                }
            }

            const scannedBankLabel = dataObj.bankLabel || dataObj.bl || 'BANK';
            const scannedBorrowerLabel = dataObj.borrowerLabel || dataObj.brl || 'BORROWER';

            setBankLabel(scannedBankLabel);
            setBorrowerLabel(scannedBorrowerLabel);

            setFormData({
                _id: dataObj._id || dataObj.id || dataObj.stampNum || '',
                description: dataObj.description || dataObj.desc || '',
                bank: dataObj.bank || dataObj.drawer || '',
                bankLabel: scannedBankLabel,
                borrower: dataObj.borrower || dataObj.drawee || '',
                borrowerLabel: scannedBorrowerLabel,
                stampDutyPaidBy: dataObj.stampDutyPaidBy || dataObj.paidBy || '',
                stampIssueDate: dataObj.stampIssueDate || dataObj.date || '',
                paidThroughChallan: dataObj.paidThroughChallan || dataObj.challan || dataObj.challanNum || '',
                totalAmount: dataObj.totalAmount || dataObj.amount || '',
                amountInWords: dataObj.amountInWords || dataObj.words || ''
            });

            setStatusMessage({
                type: 'success',
                text: 'Scanned QR data loaded into form fields! You can review or edit before saving.'
            });

            setShowScanner(false);
        } catch (err) {
            console.error('Error applying extracted QR data:', err);
            setStatusMessage({
                type: 'error',
                text: 'Failed to populate form with scanned data. Please try again.'
            });
        }
    };

    // Save form data to backend API
    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setStatusMessage({ type: '', text: '' });

        try {
            const payload = {
                ...formData,
                bankLabel: bankLabel || 'Bank',
                borrowerLabel: borrowerLabel || 'Borrower',
            };
            const response = await axios.post('/api/estamp/save', payload);
            setSavedData(response.data);
            if (response.data._id) {
                setFormData((prev) => ({ ...prev, _id: response.data._id }));
            }
            setStatusMessage({
                type: 'success',
                text: 'E-Stamp record successfully saved to MongoDB and QR Code generated!'
            });
        } catch (error) {
            console.error('Error saving eStamp:', error);
            setStatusMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to save eStamp record. Please check server connection.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    // Download QR Code as PNG image
    const handleDownloadQR = () => {
        const canvas = document.getElementById('estamp-qrcode-canvas');
        if (!canvas) return;

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `estamp-qr-${savedData?._id || 'record'}.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };

    // Populate sample data for quick testing
    const populateSample = () => {
        setFormData({
            _id: '',
            description: 'AGREEMENT - 5(af)',
            bank: 'National Bank of Pakistan',
            borrower: 'Syed Ali Raza',
            stampDutyPaidBy: 'Muhammad Usman',
            stampIssueDate: '15-SEP-2024',
            paidThroughChallan: 'CH-2024-884920',
            totalAmount: 'Rs. 5,000/-',
            amountInWords: 'Five Thousand Rupees Only'
        });
        setStatusMessage({ type: 'info', text: 'Sample eStamp data loaded.' });
    };

    // Clear form fields
    const handleClear = () => {
        setBankLabel('BANK');
        setBorrowerLabel('BORROWER');
        setFormData({
            _id: '',
            description: '',
            bank: '',
            bankLabel: 'BANK',
            borrower: '',
            borrowerLabel: 'BORROWER',
            stampDutyPaidBy: '',
            stampIssueDate: '',
            paidThroughChallan: '',
            totalAmount: '',
            amountInWords: ''
        });
        setSavedData(null);
        setStatusMessage({ type: 'info', text: 'Form cleared.' });
    };

    // Build full verification URL for QR code and external links
    const buildVerificationUrl = (data) => {
        if (!data) return '';
        const origin = window.location.origin;
        const params = new URLSearchParams();
        if (data._id) {
            params.set('id', data._id);
            params.set('stampNum', data._id);
        }
        if (data.paidThroughChallan) {
            params.set('challanNum', data.paidThroughChallan);
            params.set('paidThroughChallan', data.paidThroughChallan);
        }
        if (data.description) params.set('description', data.description);
        if (data.bank) params.set('bank', data.bank);
        if (data.bankLabel) params.set('bankLabel', data.bankLabel);
        if (data.borrower) params.set('borrower', data.borrower);
        if (data.borrowerLabel) params.set('borrowerLabel', data.borrowerLabel);
        if (data.stampDutyPaidBy) params.set('stampDutyPaidBy', data.stampDutyPaidBy);
        if (data.stampIssueDate) params.set('stampIssueDate', data.stampIssueDate);
        if (data.totalAmount) params.set('totalAmount', data.totalAmount);
        if (data.amountInWords) params.set('amountInWords', data.amountInWords);

        return `${origin}/eStampCitizenPortal/GeneratePDF/StampVerification?${params.toString()}`;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100 pb-16">
            {/* Sindh Government Header Bar */}
            <header className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 border-b border-blue-800 shadow-xl">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between p-4 gap-3">
                    <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-blue-800/80 border-2 border-yellow-500 flex items-center justify-center shadow-lg flex-shrink-0">
                            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-yellow-400" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-wide text-white font-serif uppercase">
                                Government of Sindh
                            </h1>
                            <p className="text-[10px] sm:text-xs text-blue-200 tracking-wider font-semibold">
                                eSTAMPING SYSTEM & VERIFICATION PORTAL
                            </p>
                        </div>
                    </div>

                    <div className="w-full sm:w-auto flex-wrap justify-center flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={() => setShowScanner(!showScanner)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-blue-950 font-bold px-3.5 sm:px-4 py-2 rounded-lg shadow-md transition-all text-xs sm:text-sm"
                        >
                            <QrCode className="w-4 h-4" />
                            {showScanner ? 'Close Scanner' : 'Scan / Upload QR'}
                        </button>
                        <button
                            onClick={populateSample}
                            className="flex items-center justify-center gap-1 bg-blue-800/60 hover:bg-blue-800 text-blue-100 text-xs px-3 py-2 rounded-lg border border-blue-700 transition"
                        >
                            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                            Sample Data
                        </button>
                        {onLogout && (
                            <button
                                onClick={onLogout}
                                title="Logout from Portal"
                                className="flex items-center justify-center gap-1.5 bg-red-950/60 hover:bg-red-900/80 text-red-200 text-xs px-3 py-2 rounded-lg border border-red-800/60 transition shadow-sm cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5 text-red-300" />
                                <span>Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-3 sm:px-4 mt-6 sm:mt-8 space-y-6 sm:space-y-8">
                {/* Top Query & Status Banner */}
                <div className="bg-blue-950/60 border border-blue-800/70 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row gap-2 justify-between items-start sm:items-center text-xs sm:text-sm shadow-md">
                    <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 sm:h-3 sm:w-3 bg-emerald-500"></span>
                        </span>
                        <span className="font-semibold tracking-wide text-blue-200 uppercase text-[11px] sm:text-xs">
                            Online Verification System Connected
                        </span>
                    </div>
                    {formData._id && (
                        <div className="text-[11px] sm:text-xs font-mono bg-blue-900/80 px-2.5 py-1 rounded border border-blue-700 text-yellow-300 self-start sm:self-auto">
                            ID: {formData._id}
                        </div>
                    )}
                </div>

                {/* QR Scanner Modal / Drawer */}
                {showScanner && (
                    <div className="relative bg-slate-800/90 border border-sky-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-md">
                        <button
                            onClick={() => setShowScanner(false)}
                            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-700/50 hover:bg-slate-700"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <QRScanner onDataExtracted={handleDataExtracted} />
                    </div>
                )}

                {/* Status Notification */}
                {statusMessage.text && (
                    <div
                        className={`p-3 sm:p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2.5 sm:gap-3 border ${statusMessage.type === 'success'
                                ? 'bg-emerald-950/70 border-emerald-700 text-emerald-200'
                                : statusMessage.type === 'error'
                                    ? 'bg-rose-950/70 border-rose-700 text-rose-200'
                                    : 'bg-sky-950/70 border-sky-700 text-sky-200'
                            }`}
                    >
                        {statusMessage.type === 'success' ? (
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-emerald-400" />
                        ) : statusMessage.type === 'error' ? (
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-rose-400" />
                        ) : (
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 text-sky-400" />
                        )}
                        <span>{statusMessage.text}</span>
                    </div>
                )}

                {/* Form & Table Layout matching Sindh eStamp Verification */}
                <form onSubmit={handleSave} className="bg-slate-800/80 border border-slate-700 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-900 to-indigo-900 px-4 py-3 sm:px-6 sm:py-4 border-b border-blue-800 flex items-center justify-between">
                        <h2 className="text-sm sm:text-lg font-bold text-white flex items-center gap-2">
                            <FileSpreadsheet className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0" />
                            <span className="truncate">eStamp Verification & Certificate Details</span>
                        </h2>
                        <button
                            type="button"
                            onClick={handleClear}
                            className="text-xs text-slate-300 hover:text-white underline flex-shrink-0 ml-2"
                        >
                            Clear Form
                        </button>
                    </div>

                    <div className="p-3 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                        {/* Field 1: Description */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider">
                                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                                Description
                            </label>
                            <input
                                type="text"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="e.g. AGREEMENT - 5(af)"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                            />
                        </div>

                        {/* Field 2: Bank */}
                        <div className="space-y-1 sm:space-y-1.5">
                            {/* Editable Bank Label */}
                            <div className="flex items-center space-x-1 mb-1">
                                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={bankLabel}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setBankLabel(val);
                                        setFormData((prev) => ({ ...prev, bankLabel: val }));
                                    }}
                                    className="bg-transparent text-[11px] sm:text-[12px] font-bold text-gray-300 uppercase tracking-wider focus:outline-none focus:border-b border-blue-500 w-full"
                                    placeholder="BANK LABEL"
                                />
                            </div>
                            <input
                                type="text"
                                name="bank"
                                value={formData.bank}
                                onChange={handleInputChange}
                                placeholder="e.g. National Bank of Pakistan"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                            />
                        </div>

                        {/* Field 3: Borrower */}
                        <div className="space-y-1 sm:space-y-1.5">
                            {/* Editable Borrower Label */}
                            <div className="flex items-center space-x-1 mb-1">
                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={borrowerLabel}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setBorrowerLabel(val);
                                        setFormData((prev) => ({ ...prev, borrowerLabel: val }));
                                    }}
                                    className="bg-transparent text-[11px] sm:text-[12px] font-bold text-gray-300 uppercase tracking-wider focus:outline-none focus:border-b border-blue-500 w-full"
                                    placeholder="BORROWER LABEL"
                                />
                            </div>
                            <input
                                type="text"
                                name="borrower"
                                value={formData.borrower}
                                onChange={handleInputChange}
                                placeholder="e.g. Syed Ali Raza"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                            />
                        </div>

                        {/* Field 4: Stamp Duty Paid By */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider">
                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                                Stamp Duty Paid By
                            </label>
                            <input
                                type="text"
                                name="stampDutyPaidBy"
                                value={formData.stampDutyPaidBy}
                                onChange={handleInputChange}
                                placeholder="e.g. Muhammad Usman"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                            />
                        </div>

                        {/* Field 5: Stamp Issue Date */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider">
                                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                                Stamp Issue Date
                            </label>
                            <input
                                type="text"
                                name="stampIssueDate"
                                value={formData.stampIssueDate}
                                onChange={handleInputChange}
                                placeholder="e.g. 15-SEP-2024"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                            />
                        </div>

                        {/* Field 6: Paid Through Challan */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider">
                                <CreditCard className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                                Paid Through Challan
                            </label>
                            <input
                                type="text"
                                name="paidThroughChallan"
                                value={formData.paidThroughChallan}
                                onChange={handleInputChange}
                                placeholder="e.g. CH-2024-884920"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                            />
                        </div>

                        {/* Field 7: Total Amount */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider">
                                <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                                Total Amount
                            </label>
                            <input
                                type="text"
                                name="totalAmount"
                                value={formData.totalAmount}
                                onChange={handleInputChange}
                                placeholder="e.g. Rs. 5,000/-"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                            />
                        </div>

                        {/* Field 8: Amount In Words */}
                        <div className="space-y-1 sm:space-y-1.5">
                            <label className="text-[11px] sm:text-xs font-semibold text-slate-300 flex items-center gap-1.5 sm:gap-2 uppercase tracking-wider">
                                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 flex-shrink-0" />
                                Amount In Words
                            </label>
                            <input
                                type="text"
                                name="amountInWords"
                                value={formData.amountInWords}
                                onChange={handleInputChange}
                                placeholder="e.g. Five Thousand Rupees Only"
                                className="w-full bg-slate-900 border border-slate-700 focus:border-sky-500 rounded-lg px-3 py-2 sm:px-3.5 sm:py-2.5 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500 transition"
                            />
                        </div>
                    </div>

                    {/* Form Actions */}
                    <div className="bg-slate-900/90 px-4 py-3 sm:px-6 sm:py-4 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
                        <p className="text-[11px] sm:text-xs text-slate-400 text-center sm:text-left">
                            * Make sure all fields are correctly specified before generating the QR code.
                        </p>
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full sm:w-auto justify-center flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 sm:px-6 sm:py-2.5 rounded-xl shadow-lg transition duration-200 disabled:opacity-50 text-xs sm:text-sm"
                        >
                            <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                            {isSaving ? 'Saving...' : 'Save Data & Generate QR'}
                        </button>
                    </div>
                </form>

                {/* Saved Output & QR Code Section */}
                {savedData && (
                    <div className="bg-slate-800 border border-emerald-600/50 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl space-y-4 sm:space-y-6">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-700 pb-4 gap-3 sm:gap-4">
                            <div>
                                <h3 className="text-base sm:text-lg font-bold text-emerald-400 flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <span>Generated eStamp QR Code</span>
                                </h3>
                                <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                                    Scanning this QR code opens the official public eStamp verification portal directly.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                                <a
                                    href={buildVerificationUrl(savedData)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex-1 sm:flex-initial text-center flex items-center justify-center gap-1.5 bg-blue-700 hover:bg-blue-600 text-white font-semibold text-xs px-3.5 py-2 sm:px-4 sm:py-2 rounded-xl shadow transition"
                                >
                                    Open Verification Page
                                </a>
                                <button
                                    type="button"
                                    onClick={handleDownloadQR}
                                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3.5 py-2 sm:px-5 sm:py-2 rounded-xl shadow-md transition text-xs"
                                >
                                    <Download className="w-4 h-4" />
                                    Download QR (PNG)
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-center">
                            {/* QR Code Canvas Box */}
                            <div className="flex flex-col items-center justify-center bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-inner border-4 border-slate-700 max-w-full overflow-hidden">
                                <DenseQRCode value={buildVerificationUrl(savedData)} />
                                <span className="mt-3 text-[11px] sm:text-xs text-slate-800 font-mono font-bold break-all text-center">
                                    ID: {savedData._id}
                                </span>
                            </div>

                            {/* Record Summary */}
                            <div className="lg:col-span-2 space-y-3 bg-slate-900/80 p-4 sm:p-5 rounded-xl border border-slate-700 text-xs">
                                <h4 className="font-bold text-slate-200 text-xs sm:text-sm border-b border-slate-800 pb-2">
                                    Saved Record Data Summary:
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    <div>
                                        <span className="text-slate-400">Description:</span>{' '}
                                        <span className="font-medium text-slate-200 break-words">{savedData.description || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Bank:</span>{' '}
                                        <span className="font-medium text-slate-200 break-words">{savedData.bank || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Borrower:</span>{' '}
                                        <span className="font-medium text-slate-200 break-words">{savedData.borrower || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Paid By:</span>{' '}
                                        <span className="font-medium text-slate-200 break-words">{savedData.stampDutyPaidBy || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Issue Date:</span>{' '}
                                        <span className="font-medium text-slate-200 break-words">{savedData.stampIssueDate || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Challan No:</span>{' '}
                                        <span className="font-medium text-slate-200 break-words">{savedData.paidThroughChallan || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Total Amount:</span>{' '}
                                        <span className="font-medium font-mono text-emerald-400 break-words">{savedData.totalAmount || 'N/A'}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Amount Words:</span>{' '}
                                        <span className="font-medium text-slate-200 break-words">{savedData.amountInWords || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default EStampPortal;
