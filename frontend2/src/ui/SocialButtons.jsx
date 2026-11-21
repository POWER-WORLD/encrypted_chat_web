import React from 'react';
import { FaGlobe, FaLinkedin, FaGithub } from 'react-icons/fa';
import { SiLeetcode } from 'react-icons/si';
import { AUTHOR_PROFILE } from '../config/constants';

/**
 * Verified Author / Developer Social Profiles
 * Direct integration with portfolio, LinkedIn, LeetCode, and GitHub.
 */
const SocialButtons = () => {
  const profileLinks = [
    {
      id: 'portfolio',
      name: 'Portfolio',
      handle: 'pawankumar.info',
      url: AUTHOR_PROFILE.PORTFOLIO,
      icon: <FaGlobe size={16} className="text-cyan-400 group-hover:scale-110 transition-transform" />,
      borderHover: 'hover:border-cyan-500/50 hover:bg-cyan-500/10'
    },
    {
      id: 'github',
      name: 'GitHub',
      handle: 'POWER-WORLD',
      url: AUTHOR_PROFILE.GITHUB,
      icon: <FaGithub size={16} className="text-white group-hover:scale-110 transition-transform" />,
      borderHover: 'hover:border-green-500/50 hover:bg-green-500/10'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      handle: 'pawankumar101',
      url: AUTHOR_PROFILE.LINKEDIN,
      icon: <FaLinkedin size={16} className="text-blue-400 group-hover:scale-110 transition-transform" />,
      borderHover: 'hover:border-blue-500/50 hover:bg-blue-500/10'
    },
    {
      id: 'leetcode',
      name: 'LeetCode',
      handle: 'pk3253702',
      url: AUTHOR_PROFILE.LEETCODE,
      icon: <SiLeetcode size={16} className="text-amber-400 group-hover:scale-110 transition-transform" />,
      borderHover: 'hover:border-amber-500/50 hover:bg-amber-500/10'
    }
  ];

  return (
    <div className="mt-6 w-full" aria-label="Author Profile & Architect Links">
      {/* Designer Divider */}
      <div className="relative mb-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800/80"></div>
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-[0.25em]">
          <span className="bg-black px-3 text-green-500/80 font-mono font-bold">
            ARCHITECT // PAWAN KUMAR
          </span>
        </div>
      </div>

      {/* Grid of Profile Links */}
      <div className="grid grid-cols-2 gap-2.5">
        {profileLinks.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${item.name}: ${item.handle}`}
            className={`group flex items-center justify-between p-2.5 bg-zinc-950/70 border border-zinc-800/80 rounded-xl transition-all duration-300 text-xs font-mono shadow-sm ${item.borderHover}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0">{item.icon}</span>
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-zinc-200 group-hover:text-white truncate">
                  {item.name}
                </span>
                <span className="text-[9px] text-zinc-500 group-hover:text-zinc-400 truncate">
                  {item.handle}
                </span>
              </div>
            </div>
            <span className="text-green-500/50 group-hover:text-green-400 text-xs transition-colors shrink-0 pl-1">
              ↗
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default SocialButtons;
