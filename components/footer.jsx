import { Instagram,  } from "lucide-react";
import { X } from 'lucide-react';
import React from "react";
import { FaXTwitter } from "react-icons/fa6";

const Footer = () => {
  return (
    <footer className="border-t border-gray-800/50 py-8 px-6 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-6 text-sm text-gray-400">
        Made with ❤️ by SoumyaRanjan
      </div>

      <div className="flex gap-4 items-center">
       
        <a
          href="https://www.instagram.com/absolute_saroj"
          className="text-gray-400"
        >
          <Instagram className="w-5 h-5" />
        </a>
        <a href="https://x.com/soumya_ai" className="text-gray-400">
          <svg viewBox="0 0 1200 1227" className="w-6 h-6 fill-white">
  <path d="M1149.7 0L706 543l477.1 684.3H970L548 756.7 247.5 1227H0L459.3 684.3 0 0h247.5L650 470.3 970 0z"/>
</svg>
        </a>
      </div>
    </footer>
  );
};

export default Footer;