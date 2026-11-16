import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight } from 'lucide-react';
import { useCollegeData } from '../context/CollegeDataContext';

export default function DroneVideoHero() {
  const { data } = useCollegeData();
  const { droneVideo } = data;

  const rawTitle = droneVideo?.title?.trim();
  const heroTitle =
    !rawTitle ||
    rawTitle === 'Welcome to Aditya Degree College' ||
    rawTitle === 'Welcome to Aditya Degree Colleges'
      ? 'Welcome to Aditya Degree College Rajahmundry'
      : rawTitle;

  return (
    <section className="relative w-full bg-slate-950 overflow-hidden flex items-center justify-center">
      {droneVideo?.url ? (
        <video
          key={droneVideo.url}
          src={droneVideo.url}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-auto block"
        />
      ) : (
        <div className="w-full aspect-video bg-gradient-to-br from-slate-950 via-aditya-navy to-slate-900" />
      )}

      {/* Subtle Dark Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/35 to-slate-950/20 pointer-events-none" />

      {/* Foreground Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center max-w-5xl mx-auto px-4 sm:px-6 text-center text-white">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 mb-3 sm:mb-4 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-widest">
          <Award className="w-3.5 h-3.5" />
          Aditya Degree College Rajahmundry
        </span>

        <h1 className="text-2xl sm:text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-lg">
          {heroTitle}
        </h1>

        <p className="mt-2 sm:mt-4 text-sm sm:text-xl text-slate-200 max-w-2xl mx-auto drop-shadow">
          {droneVideo?.subtitle ||
            'Empowering Future Innovators & Leaders through Excellence in Education'}
        </p>

        <div className="mt-5 sm:mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/placements"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm transition-colors shadow-lg"
          >
            <span>Explore Placements</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/academic-year"
            className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/25 text-white font-bold text-xs sm:text-sm transition-colors"
          >
            <span>Academic Year Archives</span>
          </Link>
        </div>
      </div>
    </section>
  );
}