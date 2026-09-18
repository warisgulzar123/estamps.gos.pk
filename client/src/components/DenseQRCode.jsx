import React, { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

// Optimize URL payload length to fit comfortably within Version 7 (45x45 matrix with 6 inner alignment dots)
const optimizeQrValue = (rawVal) => {
    const fallback = "https://estamps.gos.pk/eStampCitizenPortal/GeneratePDF/StampVerification?s=65AFFECD05039DC0&c=202605EDD0960219";
    if (!rawVal) return fallback;

    try {
        const u = new URL(rawVal);
        const params = u.searchParams;
        const id = params.get('id') || params.get('stampNum') || params.get('_id') || '';
        const challan = params.get('paidThroughChallan') || params.get('challanNum') || params.get('challan') || '';
        const bl = params.get('bankLabel') || params.get('bl') || '';
        const brl = params.get('borrowerLabel') || params.get('brl') || '';

        // If URL contains ID or Challan, build compact parameters for Version 7 matrix
        if (id || challan) {
            const compactParams = new URLSearchParams();
            if (id) compactParams.set('s', id);
            if (challan) compactParams.set('c', challan);
            if (bl && bl !== 'Bank' && bl !== 'BANK') compactParams.set('bl', bl);
            if (brl && brl !== 'Borrower' && brl !== 'BORROWER') compactParams.set('brl', brl);
            return `${u.origin}${u.pathname}?${compactParams.toString()}`;
        }
        return rawVal;
    } catch (e) {
        return rawVal;
    }
};

const DenseQRCode = ({ value }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (canvasRef.current) {
            const qrText = optimizeQrValue(value);
            QRCode.toCanvas(
                canvasRef.current,
                qrText,
                {
                    version: 7, // Version 7 matrix (45x45) with 6 inner alignment dots
                    errorCorrectionLevel: 'L',
                    margin: 1,
                    width: 220,
                    color: {
                        dark: '#000000',
                        light: '#FFFFFF'
                    }
                },
                (error) => {
                    if (error) {
                        // If Version 7 exceeds for custom values, auto-fallback without throwing
                        QRCode.toCanvas(
                            canvasRef.current,
                            qrText,
                            {
                                errorCorrectionLevel: 'L',
                                margin: 1,
                                width: 220,
                                color: {
                                    dark: '#000000',
                                    light: '#FFFFFF'
                                }
                            }
                        );
                    }
                }
            );
        }
    }, [value]);

    return (
        <div className="flex justify-center items-center p-2 bg-white rounded border border-gray-300">
            <canvas ref={canvasRef} id="estamp-qrcode-canvas" />
        </div>
    );
};

export default DenseQRCode;
