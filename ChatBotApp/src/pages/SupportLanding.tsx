import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageSquare, FileText } from 'lucide-react';
import { designTokens } from '../design-system/tokens';

export const SupportLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header 
        className="border-b"
        style={{ borderColor: designTokens.colors.neutral.gray200 }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: designTokens.gradients.linearActive }}
            >
              <span className="text-white font-bold text-xl">P</span>
            </div>
            <div>
              <h1 
                className="text-2xl font-bold"
                style={{ color: designTokens.colors.neutral.charcoal }}
              >
                PLDT Support
              </h1>
              <p 
                className="text-sm"
                style={{ color: designTokens.colors.neutral.gray600 }}
              >
                Enterprise Communications Hub
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 
            className="text-4xl sm:text-5xl font-bold mb-6 leading-tight"
            style={{ color: designTokens.colors.neutral.charcoal }}
          >
            Welcome to
            <span 
              className="block mt-2"
              style={{ color: designTokens.colors.pldt.red }}
            >
              PLDT Support
            </span>
          </h2>
          
          <p 
            className="text-xl sm:text-2xl mb-12 leading-relaxed"
            style={{ color: designTokens.colors.neutral.gray600 }}
          >
            Get help with your account, services, and technical issues.
            Our support team is here to assist you.
          </p>

          <Link to="/app">
            <button
              className="px-10 py-5 rounded-2xl text-lg font-semibold shadow-lg transition-all duration-300"
              style={{
                background: designTokens.gradients.linearActive,
                color: designTokens.colors.neutral.white,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = designTokens.shadows.glowActive;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = designTokens.shadows.lg;
              }}
            >
              Access Support Portal
            </button>
          </Link>
        </div>

        {/* Support Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Support Agent */}
          <Link to="/app">
            <div
              className="bg-white rounded-2xl p-8 transition-all duration-300 cursor-pointer"
              style={{
                boxShadow: designTokens.shadows.md,
                border: `1px solid ${designTokens.colors.neutral.gray200}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = designTokens.shadows.lg;
                e.currentTarget.style.borderColor = designTokens.colors.pldt.red;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = designTokens.shadows.md;
                e.currentTarget.style.borderColor = designTokens.colors.neutral.gray200;
              }}
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: designTokens.colors.alpha.redLight }}
              >
                <MessageSquare size={32} strokeWidth={2} color={designTokens.colors.pldt.red} />
              </div>
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ color: designTokens.colors.neutral.charcoal }}
              >
                Support Agent
              </h3>
              <p 
                className="leading-relaxed"
                style={{ color: designTokens.colors.neutral.gray600 }}
              >
                Chat with our AI assistant or call for voice support. Get instant help 24/7.
              </p>
            </div>
          </Link>

          {/* Tickets */}
          <Link to="/app/tickets">
            <div
              className="bg-white rounded-2xl p-8 transition-all duration-300 cursor-pointer"
              style={{
                boxShadow: designTokens.shadows.md,
                border: `1px solid ${designTokens.colors.neutral.gray200}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = designTokens.shadows.lg;
                e.currentTarget.style.borderColor = designTokens.colors.pldt.red;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = designTokens.shadows.md;
                e.currentTarget.style.borderColor = designTokens.colors.neutral.gray200;
              }}
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: designTokens.colors.alpha.redLight }}
              >
                <FileText size={32} strokeWidth={2} color={designTokens.colors.pldt.red} />
              </div>
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ color: designTokens.colors.neutral.charcoal }}
              >
                My Tickets
              </h3>
              <p 
                className="leading-relaxed"
                style={{ color: designTokens.colors.neutral.gray600 }}
              >
                View and manage your support tickets. Track issue resolution status.
              </p>
            </div>
          </Link>

          {/* Account */}
          <Link to="/app/balance">
            <div
              className="bg-white rounded-2xl p-8 transition-all duration-300 cursor-pointer"
              style={{
                boxShadow: designTokens.shadows.md,
                border: `1px solid ${designTokens.colors.neutral.gray200}`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = designTokens.shadows.lg;
                e.currentTarget.style.borderColor = designTokens.colors.pldt.red;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = designTokens.shadows.md;
                e.currentTarget.style.borderColor = designTokens.colors.neutral.gray200;
              }}
            >
              <div 
                className="w-16 h-16 rounded-xl flex items-center justify-center mb-6"
                style={{ backgroundColor: designTokens.colors.alpha.redLight }}
              >
                <Phone size={32} strokeWidth={2} color={designTokens.colors.pldt.red} />
              </div>
              <h3 
                className="text-xl font-semibold mb-3"
                style={{ color: designTokens.colors.neutral.charcoal }}
              >
                My Account
              </h3>
              <p 
                className="leading-relaxed"
                style={{ color: designTokens.colors.neutral.gray600 }}
              >
                Check your balance, plan details, and payment history.
              </p>
            </div>
          </Link>
        </div>

        {/* Quick Links */}
        <div 
          className="mt-20 pt-12 border-t max-w-5xl mx-auto"
          style={{ borderColor: designTokens.colors.neutral.gray200 }}
        >
          <div className="text-center">
            <p 
              className="text-lg mb-8"
              style={{ color: designTokens.colors.neutral.gray700 }}
            >
              Need immediate assistance?
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/app">
                <button
                  className="px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: 'transparent',
                    color: designTokens.colors.pldt.red,
                    border: `2px solid ${designTokens.colors.pldt.red}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = designTokens.colors.alpha.redLight;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Start Chat
                </button>
              </Link>
              <a href="tel:171">
                <button
                  className="px-8 py-4 rounded-xl text-base font-semibold transition-all duration-300"
                  style={{
                    backgroundColor: 'transparent',
                    color: designTokens.colors.neutral.gray700,
                    border: `2px solid ${designTokens.colors.neutral.gray300}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = designTokens.colors.neutral.gray400;
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = designTokens.colors.neutral.gray300;
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  Call 171
                </button>
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer 
        className="border-t mt-20 py-12"
        style={{ borderColor: designTokens.colors.neutral.gray200 }}
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ background: designTokens.gradients.linearActive }}
              >
                <span className="text-white font-bold">P</span>
              </div>
              <span 
                className="text-xl font-bold"
                style={{ color: designTokens.colors.neutral.charcoal }}
              >
                PLDT
              </span>
            </div>

            <p style={{ color: designTokens.colors.neutral.gray600 }}>
              © 2026 PLDT. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
