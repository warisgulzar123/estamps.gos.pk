import React from 'react';
import sindhCrest from '../image/image-removebg-preview (1).png';
import sitcLogo from '../image/image-removebg-preview.png';

const Footer = () => {
    return (
        <footer className="bg-[#384166] text-white pt-[35px] pb-[25px] w-full font-sans">

            {/* ── 3-Column Grid ── */}
            <div className="max-w-[1100px] mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">

                {/* Column 1 – About Us */}
                <div>
                    <h3 className="text-[18px] font-semibold mb-4 tracking-wide">
                        About Us
                    </h3>
                    <ul className="space-y-0">
                        <li className="border-b border-[#FFFFFF]/60 py-2">
                            <a
                                href="#"
                                className="text-[13.5px] text-slate-200 hover:text-white hover:underline transition-colors"
                            >
                                e-Stamping
                            </a>
                        </li>
                        <li className="border-b border-[#FFFFFF]/60 py-2">
                            <a
                                href="https://bor.gos.pk"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[13.5px] text-slate-200 hover:text-white hover:underline transition-colors"
                            >
                                Board Of Revenue
                            </a>
                        </li>
                        <li className="border-b border-[#FFFFFF]/60 py-2">
                            <a
                                href="#"
                                className="text-[13.5px] text-slate-200 hover:text-white hover:underline transition-colors"
                            >
                                List of Vendors
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Column 2 – Help */}
                <div>
                    <h3 className="text-[18px] font-semibold mb-4 tracking-wide">
                        Help
                    </h3>
                    <ul className="space-y-0">
                        <li className="border-b border-[#FFFFFF]/60 py-2">
                            <a
                                href="#"
                                className="text-[13.5px] text-slate-200 hover:text-white hover:underline transition-colors"
                            >
                                User Guide
                            </a>
                        </li>
                        <li className="border-b border-[#FFFFFF]/60 py-2">
                            <a
                                href="#"
                                className="text-[13.5px] text-slate-200 hover:text-white hover:underline transition-colors"
                            >
                                Helping Video(s)
                            </a>
                        </li>
                    </ul>
                </div>

                {/* Column 3 – Contact Us */}
                <div>
                    <h3 className="text-[18px] font-semibold mb-4 tracking-wide">
                        Contact Us
                    </h3>
                    <ul className="space-y-0">
                        <li className="border-b border-[#FFFFFF]/60 py-2">
                            <a
                                href="mailto:info@estamps.gos.pk"
                                className="text-[13.5px] text-slate-200 hover:text-white hover:underline transition-colors"
                            >
                                Email: info@estamps.gos.pk
                            </a>
                        </li>
                        <li className="border-b border-[#FFFFFF]/60 py-2">
                            <a
                                href="#"
                                className="text-[13.5px] text-slate-200 hover:text-white hover:underline transition-colors"
                            >
                                FAQs
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            {/* ── Divider ── */}
            <div className="border-t border-[#4F5A85]/50 mt-[28px] mb-[18px] mx-auto max-w-[1100px]" />

            {/* ── Bottom Bar ── */}
            <div className="max-w-[1100px] mx-auto px-4 flex flex-col items-center gap-3">

                {/* Emblem row */}
                <div className="flex items-center justify-center gap-5">
                    {/* Left: Sindh Crest */}
                    <img
                        src={sindhCrest}
                        alt="Government of Sindh Crest"
className="w-[38px] h-[38px] object-contain brightness-0 invert"/>
                    

                    {/* Center text */}
                    <p className="text-[13px] text-slate-200 font-medium tracking-wide text-center leading-snug">
                        Board of Revenue, Sindh &nbsp;|&nbsp; Sindh IT Company
                    </p>

                    {/* Right: SITC Logo */}
                    <img
                        src={sitcLogo}
                        alt="Sindh IT Company Logo"
className="w-[38px] h-[38px] object-contain brightness-0 invert"/>
                </div>

                {/* Copyright */}
                <p className="text-[12px] text-slate-400 text-center mt-1">
                    &copy; Copyrights GoS 2026 , All Rights Reserved
                </p>
            </div>

        </footer>
    );
};

export default Footer;
