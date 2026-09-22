import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import axios from 'axios';
import { Camera, CameraOff, Upload, AlertCircle, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';

const QRScanner = ({ onDataExtracted }) => {
    const [activeTab, setActiveTab] = useState('camera'); // 'camera' | 'file'
    const [scanError, setScanError] = useState('');
    const [scanSuccess, setScanSuccess] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [isFetchingUrl, setIsFetchingUrl] = useState(false);
    const [cameraPermissionError, setCameraPermissionError] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState('');
    const html5QrcodeScannerRef = useRef(null);

    // Initialize and stop Camera Scanner
    useEffect(() => {
        let html5Qrcode = null;

        if (activeTab === 'camera') {
            setScanError('');
            setScanSuccess('');
            setCameraPermissionError(false);

            const element = document.getElementById('qr-reader-camera');
            if (element) {
                html5Qrcode = new Html5Qrcode('qr-reader-camera');
                html5QrcodeScannerRef.current = html5Qrcode;

                const config = { fps: 10, qrbox: { width: 250, height: 250 } };

                html5Qrcode
                    .start(
                        { facingMode: 'environment' },
                        config,
                        (decodedText) => {
                            handleDecodedText(decodedText);
                        },
                        (errorMessage) => {
                            // Ignore standard frame scan errors
                        }
                    )
                    .then(() => {
                        setIsScanning(true);
                        setCameraPermissionError(false);
                    })
                    .catch((err) => {
                        console.error('Camera start error:', err);
                        setIsScanning(false);

                        const errStr = String(err?.name || err?.message || err);
                        const isPermissionError =
                            err?.name === 'NotAllowedError' ||
                            err?.name === 'PermissionDeniedError' ||
                            errStr.includes('NotAllowedError') ||
                            errStr.includes('Permission') ||
                            errStr.includes('permission') ||
                            errStr.includes('denied');

                        if (isPermissionError) {
                            setCameraPermissionError(true);
                        } else {
                            setScanError('Unable to access camera. Please check device camera availability or use File Upload.');
                        }
                    });
            }
        }

        return () => {
            if (html5QrcodeScannerRef.current && html5QrcodeScannerRef.current.isScanning) {
                html5QrcodeScannerRef.current
                    .stop()
                    .then(() => {
                        html5QrcodeScannerRef.current.clear();
                        setIsScanning(false);
                    })
                    .catch((err) => console.error('Error stopping scanner:', err));
            }
        };
    }, [activeTab]);

    // Decode scanned QR text or URL
    const handleDecodedText = async (decodedText) => {
        if (!decodedText) return;
        setScanError('');

        const trimmedText = decodedText.trim();
        const isUrl = trimmedText.startsWith('http://') || trimmedText.startsWith('https://');

        // 1. If scanned content is a URL, parse parameters, query DB, and scrape if external
        if (isUrl) {
            setIsFetchingUrl(true);
            setScanSuccess('Verification URL detected! Processing record details...');

            try {
                let urlData = {};
                let recId = '';
                try {
                    const urlObj = new URL(trimmedText);
                    const params = urlObj.searchParams;
                    recId = params.get('id') || params.get('_id') || params.get('stampNum') || params.get('paidThroughChallan') || params.get('challanNum') || '';

                    urlData = {
                        _id: params.get('id') || params.get('_id') || params.get('stampNum') || '',
                        stampNum: params.get('stampNum') || params.get('id') || params.get('_id') || '',
                        description: params.get('description') || params.get('desc') || '',
                        bank: params.get('bank') || params.get('drawer') || '',
                        bankLabel: params.get('bankLabel') || params.get('bl') || 'Bank',
                        borrower: params.get('borrower') || params.get('drawee') || '',
                        borrowerLabel: params.get('borrowerLabel') || params.get('brl') || 'Borrower',
                        stampDutyPaidBy: params.get('stampDutyPaidBy') || params.get('paidBy') || '',
                        stampIssueDate: params.get('stampIssueDate') || params.get('date') || '',
                        paidThroughChallan: params.get('paidThroughChallan') || params.get('challan') || params.get('challanNum') || '',
                        totalAmount: params.get('totalAmount') || params.get('amount') || '',
                        amountInWords: params.get('amountInWords') || params.get('words') || ''
                    };
                } catch (e) {}

                // Try fetching from local MongoDB first if identifier is present
                if (recId) {
                    try {
                        const dbRes = await axios.get(`/api/stamps/${encodeURIComponent(recId)}`);
                        if (dbRes.data && (dbRes.data._id || dbRes.data.description || dbRes.data.bank)) {
                            setScanSuccess('eStamp record found in database! All 8 fields populated.');
                            if (onDataExtracted && typeof onDataExtracted === 'function') {
                                onDataExtracted(dbRes.data);
                            }
                            setIsFetchingUrl(false);
                            return;
                        }
                    } catch (dbErr) {
                        // Silent fallback — try scraper
                    }
                }

                // Call external Sindh eStamp portal scraper endpoint
                try {
                    const response = await axios.post('/api/estamp/fetch-external', { url: trimmedText });
                    if (response.data && (response.data.data || response.data.description || response.data.bank || response.data.paidThroughChallan)) {
                        const extractedData = response.data.data || response.data;
                        const mergedData = {
                            ...urlData,
                            ...extractedData,
                            description: (extractedData.description && extractedData.description !== trimmedText)
                                ? extractedData.description
                                : (urlData.description || extractedData.description || '')
                        };

                        setScanSuccess('Government eStamp data successfully extracted and loaded into form fields!');
                        if (onDataExtracted && typeof onDataExtracted === 'function') {
                            onDataExtracted(mergedData);
                        }
                        setIsFetchingUrl(false);
                        return;
                    }
                } catch (scrapeErr) {
                    console.warn('External scrape call failed:', scrapeErr.message);
                }

                // Fallback to URL parameters if available
                if (urlData.description || urlData.bank || urlData.borrower || urlData.paidThroughChallan || urlData.totalAmount) {
                    setScanSuccess('Extracted URL parameters into eStamp form fields.');
                    if (onDataExtracted && typeof onDataExtracted === 'function') {
                        onDataExtracted(urlData);
                    }
                } else {
                    setScanSuccess('URL loaded into form description.');
                    if (onDataExtracted && typeof onDataExtracted === 'function') {
                        onDataExtracted({ description: trimmedText });
                    }
                }
            } catch (err) {
                console.error('URL fetch error:', err);
                setScanSuccess('Extracted scanned data into form.');
                if (onDataExtracted && typeof onDataExtracted === 'function') {
                    onDataExtracted({ description: trimmedText });
                }
            } finally {
                setIsFetchingUrl(false);
            }
            return;
        }

        // 2. Try parsing JSON directly
        try {
            const parsedData = JSON.parse(trimmedText);
            setScanSuccess('QR Code successfully scanned and all fields loaded!');
            if (onDataExtracted && typeof onDataExtracted === 'function') {
                onDataExtracted(parsedData);
            }
            return;
        } catch (parseError) {}

        // 3. Try parsing Key-Value structured lines (e.g. "Description: ...\nBank: ...")
        const lines = trimmedText.split(/\r?\n/);
        const parsedLines = {};
        for (const line of lines) {
            const match = line.match(/^([^:]+):\s*(.+)$/);
            if (match) {
                const key = match[1].trim().toLowerCase();
                const val = match[2].trim();
                if (/desc/i.test(key)) parsedLines.description = val;
                else if (/bank/i.test(key)) parsedLines.bank = val;
                else if (/borrower|drawee|first party/i.test(key)) parsedLines.borrower = val;
                else if (/paid by|second party|duty/i.test(key)) parsedLines.stampDutyPaidBy = val;
                else if (/date|issue/i.test(key)) parsedLines.stampIssueDate = val;
                else if (/challan/i.test(key)) parsedLines.paidThroughChallan = val;
                else if (/words/i.test(key)) parsedLines.amountInWords = val;
                else if (/amount/i.test(key)) parsedLines.totalAmount = val;
            }
        }

        if (Object.keys(parsedLines).length >= 2) {
            setScanSuccess('Extracted 8 eStamp fields from scanned text!');
            if (onDataExtracted && typeof onDataExtracted === 'function') {
                onDataExtracted(parsedLines);
            }
            return;
        }

        // 4. Plain text fallback
        const fallbackData = {
            description: trimmedText,
            bank: '',
            borrower: '',
            stampDutyPaidBy: '',
            stampIssueDate: '',
            paidThroughChallan: '',
            totalAmount: '',
            amountInWords: ''
        };
        setScanSuccess('Scanned text loaded into form.');
        if (onDataExtracted && typeof onDataExtracted === 'function') {
            onDataExtracted(fallbackData);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setSelectedFileName(file.name);
        setScanError('');
        setScanSuccess('');

        try {
            const html5Qrcode = new Html5Qrcode('qr-reader-file-temp');
            const decodedText = await html5Qrcode.scanFile(file, true);
            html5Qrcode.clear();
            await handleDecodedText(decodedText);
        } catch (err) {
            console.error('File scan error:', err);
            setScanError('Could not read a QR code from the selected image. Please ensure the QR code is clear.');
        }
    };

    return (
        <div className="w-full max-w-xl mx-auto bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6 border-b border-slate-700 pb-4">
                <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-sky-400" />
                    QR Code Scanner
                </h2>

                {/* Tab Selection Buttons */}
                <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
                    <button
                        type="button"
                        onClick={() => setActiveTab('camera')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'camera'
                                ? 'bg-sky-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                    >
                        <Camera className="w-4 h-4" />
                        Live Camera
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('file')}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'file'
                                ? 'bg-sky-600 text-white shadow-lg'
                                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                            }`}
                    >
                        <Upload className="w-4 h-4" />
                        Upload Image
                    </button>
                </div>
            </div>

            {/* Camera Tab View */}
            {activeTab === 'camera' && (
                <div className="space-y-4">
                    {cameraPermissionError ? (
                        /* Explicit Camera Access Blocked Banner */
                        <div className="p-5 bg-amber-950/80 border border-amber-600/70 rounded-xl text-amber-200 text-sm space-y-3">
                            <div className="flex items-start gap-3">
                                <CameraOff className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="font-semibold text-amber-300">
                                        Camera Access Blocked. Please click the lock icon next to localhost URL in browser address bar to allow camera, or use the File Upload option below.
                                    </p>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('file')}
                                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow transition"
                                >
                                    Use File Upload Option
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="relative overflow-hidden rounded-xl bg-slate-900 border border-slate-700 min-h-[300px] flex items-center justify-center">
                                <div id="qr-reader-camera" className="w-full h-full"></div>
                                {!isScanning && !scanError && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-slate-400 text-sm">
                                        Requesting camera permission...
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-center text-slate-400">
                                Position the eStamp QR code in front of your camera to scan automatically.
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* File Upload Tab View */}
            {activeTab === 'file' && (
                <div className="space-y-4">
                    <div id="qr-reader-file-temp" className="hidden"></div>
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-600 hover:border-sky-500 rounded-xl cursor-pointer bg-slate-900/60 hover:bg-slate-900 transition-all group">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                            <Upload className="w-10 h-10 mb-3 text-slate-400 group-hover:text-sky-400 transition-colors" />
                            <p className="mb-2 text-sm text-slate-200 font-medium">
                                Click to upload or drag & drop a QR image
                            </p>
                            <p className="text-xs text-slate-400">PNG, JPG, JPEG, WEBP</p>
                            {selectedFileName && (
                                <div className="mt-3 text-xs font-semibold text-sky-400 bg-sky-950/50 px-3 py-1 rounded-full border border-sky-800">
                                    File: {selectedFileName}
                                </div>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileUpload}
                        />
                    </label>
                </div>
            )}

            {/* Loading state for external URL fetch */}
            {isFetchingUrl && (
                <div className="mt-4 p-3 rounded-lg bg-sky-950/80 border border-sky-700/60 text-sky-200 text-sm flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin text-sky-400 flex-shrink-0" />
                    <span>Fetching and parsing official eStamp webpage...</span>
                </div>
            )}

            {/* Feedback Messages */}
            {scanSuccess && !isFetchingUrl && (
                <div className="mt-4 p-3 rounded-lg bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 text-sm flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                    <span>{scanSuccess}</span>
                </div>
            )}

            {scanError && !cameraPermissionError && (
                <div className="mt-4 p-3 rounded-lg bg-rose-950/60 border border-rose-700/50 text-rose-300 text-sm flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                    <span>{scanError}</span>
                </div>
            )}
        </div>
    );
};

export default QRScanner;
