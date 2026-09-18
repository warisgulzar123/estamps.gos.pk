import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, PhoneCall } from 'lucide-react';
import logoImg from '../image/Logo-eStamp.png';
import Footer from './Footer';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login submission
        alert(`Login attempted for user: ${username}`);
    };

    return (
        <div className="min-h-screen bg-[#F4F4F4] text-[#333333] font-sans antialiased flex flex-col justify-between">
            <div>
                {/* Top Light Green Bar */}
                <div className="bg-[#DCEFE3] md:bg-[#DFF0D8] border-b border-[#D6E9C6] text-[#255932] text-[11px] md:text-[12.5px] font-[500] h-[26px] md:h-[32px] px-2 md:px-[15px] py-1 flex items-center justify-between overflow-hidden">
                    <div className="flex items-center">
                        <Home className="w-3.5 h-3.5 text-[#3b82f6] inline mr-1 flex-shrink-0" />
                        <span className="text-[12px] font-medium text-[#222222] md:text-[12.5px] md:text-[#255932]">For Any Query:</span>
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
                <header className="relative w-full bg-[#2B3990] md:bg-[#2C3686] text-white pt-2 pb-0 px-2 md:pt-0 md:pb-0 md:px-0 md:h-[82px] flex flex-col md:flex-row justify-between md:items-center overflow-hidden">
                    {/* Mobile Overlay Text Rows */}
                    <div className="w-full md:hidden">
                        {/* Overlay Text Row 1 */}
                        <div className="flex items-center w-full px-1">
                            <span className="text-[#112240] text-[12px] font-semibold tracking-tight ml-3">021-38892347</span>
                            <span className="text-[#112240] text-[12px] font-semibold tracking-tight ml-6">Email: info@estamps.gos.pk</span>
                        </div>
                        {/* Overlay Text Row 2 */}
                        <div className="w-full px-1">
                            <Link to="/eStampCitizenPortal/Account/Login" className="text-[#000000] text-[18px] tracking-normal block text-right mt-0.5 cursor-pointer">
                                Member Login
                            </Link>
                        </div>
                    </div>

                    {/* Logo Container */}
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
                        <Link to="/" className="text-[13px] text-[#333333] font-normal hover:underline hover:text-black">
                            Home
                        </Link>
                    </div>
                </nav>

                {/* Main Login Content */}
                <main className="px-4 py-0 md:py-[40px]">
                    {/* Heading: Centered serif font title "Log In" */}
                    <h1 className="text-[28px] font-bold text-[#111111] font-serif text-center mb-[10px] tracking-normal">
                        Log In
                    </h1>

                    {/* Card Container */}
                    <div className="max-w-[420px] mx-auto mt-5 mb-6 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-[#E2E2E2] overflow-hidden">
                        {/* Card Header */}
                        <div className="bg-[#F8F8F8] py-[12px] px-[24px] border-b border-[#E2E2E2]">
                            <h2 className="font-serif text-[17px] text-[#222222] font-semibold">
                                Use your account to log in.
                            </h2>
                        </div>

                        {/* Card Form */}
                        <form onSubmit={handleSubmit} className="p-[28px] space-y-7">
                            <div>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter User Name"
                                    className="border-b border-[#D0D0D0] focus:border-[#78C478] outline-none w-full py-2 text-[14px] placeholder:text-[#A0A0A0] text-[#333333] bg-transparent transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter Password"
                                    className="border-b border-[#D0D0D0] focus:border-[#78C478] outline-none w-full py-2 text-[14px] placeholder:text-[#A0A0A0] text-[#333333] bg-transparent transition-colors"
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="bg-[#78C478] hover:bg-[#68b468] text-white px-[24px] py-[9px] font-medium uppercase text-[14px] tracking-wide shadow-sm cursor-pointer transition-colors border-none"
                                >
                                    LOG IN
                                </button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>

            {/* Official eStamp Footer */}
            <Footer />
        </div>
    );
};

export default Login;
