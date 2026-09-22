import React, { useEffect, useState } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Home, PhoneCall, XCircle } from 'lucide-react';
import logoImg from '../image/Logo-eStamp.png';
import Footer from './Footer';

const PublicStampVerification = () => {
    const [searchParams] = useSearchParams();
    const routeParams = useParams();

    // ── Identifier priority: prefer route params, then MongoDB _id / stampNum, then challanNum ──
    const primaryId =
        routeParams.id ||
        searchParams.get('id') ||
        searchParams.get('_id') ||
        searchParams.get('stampNum') ||
        searchParams.get('s') ||
        searchParams.get('stampId') ||
        '';

    const challanId =
        searchParams.get('paidThroughChallan') ||
        searchParams.get('challanNum') ||
        searchParams.get('challan') ||
        searchParams.get('c') ||
        '';

    // Use the best available identifier for the API call
    const queryId = primaryId || challanId;

    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Build a record object from URL query params (used as last-resort fallback)
    const buildUrlRecord = () => ({
        description:        searchParams.get('description')      || searchParams.get('desc')       || '',
        bank:               searchParams.get('bank')             || searchParams.get('drawer')      || '',
        bankLabel:          searchParams.get('bankLabel')        || searchParams.get('bl')          || 'Bank',
        borrower:           searchParams.get('borrower')         || searchParams.get('drawee')      || '',
        borrowerLabel:      searchParams.get('borrowerLabel')    || searchParams.get('brl')         || 'Borrower',
        stampDutyPaidBy:    searchParams.get('stampDutyPaidBy')  || searchParams.get('paidBy')      || '',
        stampIssueDate:     searchParams.get('stampIssueDate')   || searchParams.get('date')        || '',
        paidThroughChallan: challanId,
        totalAmount:        searchParams.get('totalAmount')      || searchParams.get('amount')      || '',
        amountInWords:      searchParams.get('amountInWords')    || searchParams.get('words')       || '',
    });

    useEffect(() => {
        document.title = 'Government of Sindh - eStamping citizen Portal';
        if (!queryId) {
            setLoading(false);
            setError(true);
            return;
        }

        const fetchRecord = async () => {
            setLoading(true);
            setError(false);

            // Helper: attempt a single API fetch and return the data or null
            const tryFetch = async (id) => {
                if (!id) return null;
                try {
                    // Try /api/stamps endpoint first, then /api/estamp
                    let res;
                    try {
                        res = await axios.get(`/api/stamps/${encodeURIComponent(id)}`);
                    } catch (e) {
                        res = await axios.get(`/api/estamp/${encodeURIComponent(id)}`);
                    }

                    if (res && res.data && (res.data._id || res.data.description || res.data.paidThroughChallan || res.data.stampNum)) {
                        return res.data;
                    }
                    return null;
                } catch (err) {
                    // 404 or error — caller will try next identifier
                    return null;
                }
            };

            // 1️⃣ Try primary identifier (MongoDB _id / stampNum)
            let found = await tryFetch(primaryId);

            // 2️⃣ If primary failed AND challanId is different, retry with challan number
            if (!found && challanId && challanId !== primaryId) {
                found = await tryFetch(challanId);
            }

            // Strict verification: only display record if found in MongoDB Atlas
            if (found) {
                setRecord(found);
            } else {
                setError(true);
            }

            setLoading(false);
        };

        fetchRecord();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [queryId]);

    // Error Screen Render if record is missing or failed
    if (error || (!loading && !record)) {
        return (
            <div className="min-h-screen bg-[#F4F4F4] text-[#333333] font-sans antialiased flex flex-col justify-between">
                <div>
                    {/* Top Light Green Bar */}
                    <div className="bg-[#DCEFE3] md:bg-[#DFF0D8] border-b border-[#D6E9C6] text-[#255932] text-[11px] md:text-[12.5px] font-[500] h-[26px] md:h-[32px] px-2 md:px-[15px] py-1 flex items-center justify-between overflow-hidden">
                        <div className="flex items-center">
                            <Home className="w-3.5 h-3.5 text-[#3b82f6] inline mr-1 flex-shrink-0" />
                            <span className="text-[12px] font-normal text-[#222222] md:text-[12.5px] md:text-[#255932]">For Any Query:</span>
                            <PhoneCall className="w-3.5 h-3.5 text-[#000] inline ml-1 fill-black flex-shrink-0 md:hidden" />
                            <span className="hidden md:inline ml-1">📞 021-38892347 &nbsp; Email: info@estamps.gos.pk</span>
                        </div>
                        <div className="hidden md:block ml-auto">
                            <Link to="/eStampCitizenPortal/Account/Login" className="font-bold cursor-pointer hover:underline text-[#255932]">
                                Member Login
                            </Link>
                        </div>
                    </div>

                    {/* Main Navy Blue Banner */}
                    <header className="relative w-full bg-[#2B3990] md:bg-[#2C3686] text-white pt-0 pb-0 px-2 md:pt-0 md:pb-0 md:px-0 md:h-[82px] flex flex-col md:flex-row justify-between md:items-center overflow-hidden">
                        <div className="w-full md:hidden">
                            <div className="flex items-center w-full">
                                <span className="text-[#112240] text-[12px] font-normal tracking-tight ml-3">021-38892347</span>
                                <span className="text-[#112240] text-[12px] font-normal tracking-tight ml-6">Email: info@estamps.gos.pk</span>
                            </div>
                            <div className="w-full px-1">
                                <Link to="/eStampCitizenPortal/Account/Login" className="text-[#000000] text-[18px] tracking-normal block text-right mt-0.5 cursor-pointer">
                                    Member Login
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-end md:items-center px-0 md:pl-[45px] gap-4 mb-0 pb-0 mt-1 md:mt-0">
                            <img
                                src={logoImg}
                                alt="e-STAMPING"
                                className="h-[48px] md:h-[58px] object-contain mb-0 pb-0"
                            />
                        </div>
                    </header>

                    {/* Grey Home Sub-bar */}
                    <nav className="bg-[#EBEBEB] h-[32px] border-b border-[#DDDDDD] flex items-center">
                        <div className="ml-[15px] md:ml-[45px]">
                            <Link
                                to="/eStampCitizenPortal/GeneratePDF/StampVerification"
                                onClick={(e) => {
                                    if (window.location.pathname.includes('/StampVerification')) {
                                        e.preventDefault();
                                    }
                                }}
                                className="text-[13px] text-[#333333] font-normal hover:underline hover:text-black cursor-pointer"
                            >
                                Home
                            </Link>
                        </div>
                    </nav>

                    <main className="mt-[20px] md:mt-[45px] mx-auto md:ml-[80px] mb-[40px] md:mb-[50px] w-[92%] md:w-full max-w-[1200px] px-0 md:pr-[30px]">
                        <div className="flex flex-col items-center justify-center p-8 bg-red-50 border border-red-300 rounded-lg text-center my-10 max-w-xl mx-auto shadow-sm">
                            <XCircle className="w-16 h-16 text-red-600 mb-4 flex-shrink-0" />
                            <h2 className="text-xl font-bold text-red-700 mb-2">Verification Failed / Record Not Found</h2>
                            <p className="text-gray-700 text-sm">
                                The eStamp certificate record could not be found or the QR code contains invalid parameters. The scanned QR code or URL parameters do not match any verified database record.
                            </p>
                        </div>
                    </main>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F4F4F4] text-[#333333] font-sans antialiased flex flex-col justify-between">
            <div>
                {/* Top Light Green Bar */}
                <div className="bg-[#DCEFE3] md:bg-[#DFF0D8] border-b border-[#D6E9C6] text-[#255932] text-[11px] md:text-[12.5px] font-[500] h-[26px] md:h-[32px] px-2 md:px-[15px] py-1 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center">
                        <Home className="w-3.5 h-3.5 text-[#3b82f6] inline mr-1 flex-shrink-0" />
                        <span className="text-[12px] font-normal text-[#222222] md:text-[12.5px] md:text-[#255932]">For Any Query:</span>
                        <PhoneCall className="w-3.5 h-3.5 text-[#000] inline ml-1 fill-black flex-shrink-0 md:hidden" />
                        <span className="hidden md:inline ml-1">📞 021-38892347 &nbsp; Email: info@estamps.gos.pk</span>
                    </div>
                    <div className="hidden md:block ml-auto">
                        <Link to="/eStampCitizenPortal/Account/Login" className="font-bold cursor-pointer hover:underline text-[#255932]">
                            Member Login
                        </Link>
                    </div>
                </div>

                {/* Main Navy Blue Banner */}
                <header className="relative w-full bg-[#2B3990] md:bg-[#2C3686] text-white pt-0 pb-0 px-2 md:pt-0 md:pb-0 md:px-0 md:h-[82px] flex flex-col md:flex-row justify-between md:items-center overflow-hidden">
                    {/* Mobile Overlay Text Rows */}
                    <div className="w-full md:hidden">
                        {/* Overlay Text Row 1 */}
                        <div className="flex items-center w-full">
                            <span className="text-[#112240] text-[12px] font-normal tracking-tight ml-3">021-38892347</span>
                            <span className="text-[#112240] text-[12px] font-normal tracking-tight ml-6">Email: info@estamps.gos.pk</span>
                        </div>
                        {/* Overlay Text Row 2 */}
                        <div className="w-full px-1">
                            <Link to="/eStampCitizenPortal/Account/Login" className="text-[#000000] text-[18px] tracking-normal block text-right mt-0.5 cursor-pointer">
                                Member Login
                            </Link>
                        </div>
                    </div>

                    {/* Logo Container (Bottom Sticking) */}
                    <div className="flex items-end md:items-center px-0 md:pl-[45px] gap-4 mb-0 pb-0 mt-1 md:mt-0">
                        <img
                            src={logoImg}
                            alt="e-STAMPING"
                            className="h-[48px] md:h-[58px] object-contain mb-0 pb-0"
                        />
                    </div>
                </header>

                {/* Grey Home Sub-bar */}
                <nav className="bg-[#EBEBEB] h-[32px] border-b border-[#DDDDDD] flex items-center">
                    <div className="ml-[15px] md:ml-[45px]">
                        <Link
                            to="/eStampCitizenPortal/GeneratePDF/StampVerification"
                            onClick={(e) => {
                                if (window.location.pathname.includes('/StampVerification')) {
                                    e.preventDefault();
                                }
                            }}
                            className="text-[13px] text-[#333333] font-normal hover:underline hover:text-black cursor-pointer"
                        >
                            Home
                        </Link>
                    </div>
                </nav>

                {/* Main Container */}
                <main className="mt-[20px] md:mt-[45px] mx-auto md:ml-[80px] mb-[40px] md:mb-[50px] w-[92%] md:w-full max-w-[1200px] px-0 md:pr-[30px]">
                    {/* Title */}
                    <h1 className="text-[18px] md:text-[21px] font-[700] text-[#2B2B2B] mb-[18px] md:mb-[22px] tracking-tight">
                        eStamp Online Verification
                    </h1>

                    {loading ? (
                        <div className="py-5 text-center text-gray-500 text-[13px] animate-pulse">
                            Fetching official verification record details...
                        </div>
                    ) : (
                        <table className="w-full border-collapse border border-[#E0E0E0] text-left bg-[#F4F4F4]">
                            <tbody>
                                {/* Row 1: Description */}
                                <tr>
                                    <td className="w-[40%] md:w-[36%] bg-[#F4F4F4] font-bold text-[#222222] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        Description
                                    </td>
                                    <td className="w-[60%] md:w-[64%] bg-[#F4F4F4] font-normal text-[#333333] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.description}
                                    </td>
                                </tr>

                                {/* Row 2: Bank */}
                                <tr>
                                    <td className="w-[40%] md:w-[36%] bg-[#F4F4F4] font-bold text-[#222222] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.bankLabel || 'Bank'}
                                    </td>
                                    <td className="w-[60%] md:w-[64%] bg-[#F4F4F4] font-normal text-[#333333] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.bank || record.bankName}
                                    </td>
                                </tr>

                                {/* Row 3: Borrower */}
                                <tr>
                                    <td className="w-[40%] md:w-[36%] bg-[#F4F4F4] font-bold text-[#222222] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.borrowerLabel || 'Borrower'}
                                    </td>
                                    <td className="w-[60%] md:w-[64%] bg-[#F4F4F4] font-normal text-[#333333] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.borrower}
                                    </td>
                                </tr>

                                {/* Row 4: Stamp Duty Paid By */}
                                <tr>
                                    <td className="w-[40%] md:w-[36%] bg-[#F4F4F4] font-bold text-[#222222] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        Stamp Duty Paid By
                                    </td>
                                    <td className="w-[60%] md:w-[64%] bg-[#F4F4F4] font-normal text-[#333333] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.stampDutyPaidBy}
                                    </td>
                                </tr>

                                {/* Row 5: Stamp Issue Date */}
                                <tr>
                                    <td className="w-[40%] md:w-[36%] bg-[#F4F4F4] font-bold text-[#222222] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        Stamp Issue Date
                                    </td>
                                    <td className="w-[60%] md:w-[64%] bg-[#F4F4F4] font-normal text-[#333333] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.stampIssueDate}
                                    </td>
                                </tr>

                                {/* Row 6: Paid Through Challan */}
                                <tr>
                                    <td className="w-[40%] md:w-[36%] bg-[#F4F4F4] font-bold text-[#222222] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        Paid Through Challan
                                    </td>
                                    <td className="w-[60%] md:w-[64%] bg-[#F4F4F4] font-normal text-[#333333] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.paidThroughChallan}
                                    </td>
                                </tr>

                                {/* Row 7: Total Amount */}
                                <tr>
                                    <td className="w-[40%] md:w-[36%] bg-[#F4F4F4] font-bold text-[#222222] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        Total Amount
                                    </td>
                                    <td className="w-[60%] md:w-[64%] bg-[#F4F4F4] font-normal text-[#333333] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.totalAmount}
                                    </td>
                                </tr>

                                {/* Row 8: Amount In Words */}
                                <tr>
                                    <td className="w-[40%] md:w-[36%] bg-[#F4F4F4] font-bold text-[#222222] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        Amount In Words
                                    </td>
                                    <td className="w-[60%] md:w-[64%] bg-[#F4F4F4] font-normal text-[#333333] text-[12px] md:text-[13.5px] border border-[#E0E0E0] px-[8px] md:px-[14px] py-[8px] md:py-[10px] align-top break-words">
                                        {record.amountInWords}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    )}
                </main>
            </div>

            {/* Official eStamp Footer */}
            <Footer />
        </div>
    );
};

export default PublicStampVerification;
