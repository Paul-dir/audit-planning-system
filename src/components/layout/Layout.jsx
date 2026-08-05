import { useState } from 'react';
import Sidebar from './Sidebar.jsx';
import TopBar from './TopBar.jsx';

export default function Layout({ children, activeView, onNavigate, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeView={activeView} onNavigate={onNavigate} />
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <TopBar title={title} subtitle={subtitle} />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
