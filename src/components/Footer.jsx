import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-aditya-navy text-slate-300 border-t border-white/10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-white font-bold text-lg tracking-wide">
              ADITYA DEGREE COLLEGE RAJAHMUNDRY AUTONOMOUS
            </h3>
            <p className="mt-3 text-sm text-slate-300 leading-relaxed">
              Shaping disciplined, industry-ready graduates through academic rigor,
              innovation expos, community service, and premier campus placements.
            </p>
          </div>

          <div>
            <h4 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link to="/management" className="hover:text-white transition-colors">
                  College Management
                </Link>
              </li>
              <li>
                <Link to="/academic-year" className="hover:text-white transition-colors">
                  Academic Year Archive
                </Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-white transition-colors">
                  Campus Activities
                </Link>
              </li>
              <li>
                <Link to="/project-expos" className="hover:text-white transition-colors">
                  Project Expo
                </Link>
              </li>
              <li>
                <Link to="/placements" className="hover:text-white transition-colors">
                  Campus Placements
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-amber-400 font-semibold text-sm uppercase tracking-wider">
              Campus Contact &amp; Portal
            </h4>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Near APSRTC Complex, Tadithota, Rajamahendravaram (Rajahmundry), Andhra Pradesh 533103
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <a href="tel:+919866076668" className="hover:text-white transition-colors">
                    98660 76668
                  </a>
                  {', '}
                  <a href="tel:+919000376664" className="hover:text-white transition-colors">
                    90003 76664
                  </a>
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-400 shrink-0" />
                <a
                  href="mailto:adcrjy@aditya.ac.in"
                  className="hover:text-white transition-colors"
                >
                  adcrjy@aditya.ac.in
                </a>
              </li>
              <li className="pt-2">
                <a
                  href="https://analysis.aditya.ac.in/v23/student/#/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
                >
                  <span>Student Analysis Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          <p>
            &copy; {new Date().getFullYear()} ADITYA DEGREE COLLEGE RAJAHMUNDRY AUTONOMOUS. All Rights Reserved.
          </p>
          <div className="mt-2">
            <Link
              to="/about-development-team"
              className="text-slate-400 hover:text-amber-400 transition-colors underline underline-offset-4"
            >
              About Development Team
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}