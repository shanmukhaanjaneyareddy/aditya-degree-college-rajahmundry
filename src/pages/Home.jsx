import React from 'react';
import DroneVideoHero from '../components/DroneVideoHero';
import TopPackagesSection from '../components/TopPackagesSection';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* 1. College Drone View Video */}
      <DroneVideoHero />

      {/* 2. Top 10 Highest Package Placements */}
      <TopPackagesSection />
    </div>
  );
}