import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, ExternalLink, GraduationCap } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Management', path: '/management' },
  { label: 'Academic Year', path: '/academic-year' },
  { label: 'Activities', path: '/activities' },
  { label: 'Project Expos', path: '/project-expos' },
  { label: 'Placements', path: '/placements' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-aditya-navy text-white shadow-lg border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Top-Left: Aditya Degree College Rajahmundry Logo -> Redirects to Home */}
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className="flex items-center gap-3 group focus:outline-none"
            title="Aditya Degree College Rajahmundry — Home"
          >
            {!logoError ? (
              <img
                src="/assets/logo/aditya-logo.png"
                alt="Aditya Degree College Rajahmundry Logo"
                onError={() => setLogoError(true)}
                className="h-12 w-12 object-contain rounded-lg bg-white p-1 shadow-sm group-hover:scale-105 transition-transform"
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-aditya-accent text-aditya-navy flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
            )}
            <div className="leading-tight">
              <span className="block text-base sm:text-lg font-extrabold tracking-wide text-white">
                ADITYA
              </span>
              <span className="block text-[11px] sm:text-xs font-semibold text-amber-400 tracking-wider uppercase">
                Degree College Rajahmundry
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (No Admin Login link shown publicly) */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-aditya-accent text-aditya-navy font-semibold shadow-sm'
                      : 'text-slate-200 hover:text-white hover:bg-white/10'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Top-Right: External Student Login Button */}
          <div className="hidden sm:flex items-center gap-3">
            <a
              href="https://analysis.aditya.ac.in/v23/student/#/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-aditya-navy font-bold text-sm shadow-md transition-all"
            >
              <span>Student Login</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="lg:hidden p-2 rounded-lg text-slate-200 hover:bg-white/10 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-aditya-blue border-t border-white/10 px-4 pt-3 pb-5 space-y-2">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? 'bg-aditya-accent text-aditya-navy font-semibold'
                    : 'text-slate-100 hover:bg-white/10'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="pt-2 border-t border-white/10">
            <a
              href="https://analysis.aditya.ac.in/v23/student/#/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-amber-500 text-aditya-navy font-bold text-sm"
            >
              <span>Student Login</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      )}
    </header>
  );
}