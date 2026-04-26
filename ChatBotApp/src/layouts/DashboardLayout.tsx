import React from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { MessageSquare, FileText, Wallet } from 'lucide-react';
import { designTokens } from '../design-system/tokens';
import { SupportAgent } from '../features/support/SupportAgent';
import { TicketManager } from '../features/tickets/TicketManager';
import { BalanceDisplay } from '../features/balance/BalanceDisplay';

export const DashboardLayout: React.FC = () => {
  const location = useLocation();

  const tabs = [
    {
      id: 'support',
      label: 'Support Agent',
      path: '/app',
      icon: MessageSquare,
    },
    {
      id: 'tickets',
      label: 'My Tickets',
      path: '/app/tickets',
      icon: FileText,
    },
    {
      id: 'balance',
      label: 'My Account',
      path: '/app/balance',
      icon: Wallet,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname === path;
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-white overflow-hidden">
      {/* Header */}
      <header 
        className="border-b flex-shrink-0"
        style={{ 
          borderColor: designTokens.colors.neutral.gray200,
          backgroundColor: designTokens.colors.neutral.white,
        }}
      >
        <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 sm:gap-3">
              <div 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md transition-transform hover:scale-105"
                style={{ background: designTokens.gradients.linearActive }}
              >
                <span className="text-white font-bold text-lg sm:text-xl">P</span>
              </div>
              <div className="hidden sm:block">
                <h1 
                  className="text-xl sm:text-2xl font-bold"
                  style={{ color: designTokens.colors.neutral.charcoal }}
                >
                  PLDT Support
                </h1>
                <p 
                  className="text-xs sm:text-sm"
                  style={{ color: designTokens.colors.neutral.gray600 }}
                >
                  Enterprise Communications Hub
                </p>
              </div>
            </Link>

            {/* Back to Home Link */}
            <Link 
              to="/"
              className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: 'transparent',
                color: designTokens.colors.neutral.gray600,
                border: `1px solid ${designTokens.colors.neutral.gray300}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = designTokens.colors.pldt.red;
                e.currentTarget.style.color = designTokens.colors.pldt.red;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = designTokens.colors.neutral.gray300;
                e.currentTarget.style.color = designTokens.colors.neutral.gray600;
              }}
            >
              Back to Home
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="px-4 sm:px-6 md:px-8 lg:px-12 overflow-x-auto scrollbar-hide">
          <div className="flex gap-1 min-w-max">
            {tabs.map((tab) => {
              const active = isActive(tab.path);
              const Icon = tab.icon;

              return (
                <Link
                  key={tab.id}
                  to={tab.path}
                  className="relative px-4 sm:px-6 lg:px-8 py-3 lg:py-4 font-semibold transition-all duration-200 flex items-center gap-2 sm:gap-3 rounded-t-lg sm:rounded-t-xl whitespace-nowrap"
                  style={{
                    color: active 
                      ? designTokens.colors.pldt.red 
                      : designTokens.colors.neutral.gray600,
                    backgroundColor: active
                      ? designTokens.colors.alpha.redLight
                      : 'transparent',
                    borderBottom: active 
                      ? `3px solid ${designTokens.colors.pldt.red}` 
                      : '3px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = designTokens.colors.pldt.red;
                      e.currentTarget.style.backgroundColor = designTokens.colors.alpha.redLight;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.color = designTokens.colors.neutral.gray600;
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <Icon size={20} strokeWidth={2.5} />
                  <span className="text-sm sm:text-base">{tab.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<SupportAgent />} />
          <Route path="/tickets" element={<TicketManager />} />
          <Route path="/balance" element={<BalanceDisplay />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </main>
    </div>
  );
};
