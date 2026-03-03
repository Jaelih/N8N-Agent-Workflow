import { useState } from 'react';
import { MessageSquare, FileText, CreditCard, Phone, ArrowRight, Sparkles } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import ChatContainer from './components/ChatContainer';
import { TicketManager } from './components/TicketManager';
import { BalanceDisplay } from './components/BalanceDisplay';
import { AICallCenter } from './components/AICallCenter';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [selectedTab, setSelectedTab] = useState('chat');

  const handleFeatureSelect = (tab: string) => {
    setSelectedTab(tab);
    setShowWelcome(false);
  };

  const features = [
    {
      id: 'chat',
      icon: MessageSquare,
      title: 'Chat Support',
      description: 'Get instant help from our AI-powered assistant for billing, technical issues, and plan information.',
      color: 'from-blue-500 to-blue-600',
      hoverColor: 'hover:from-blue-600 hover:to-blue-700'
    },
    {
      id: 'tickets',
      icon: FileText,
      title: 'Support Tickets',
      description: 'Create and track support tickets for issues that need documentation or follow-up assistance.',
      color: 'from-purple-500 to-purple-600',
      hoverColor: 'hover:from-purple-600 hover:to-purple-700'
    },
    {
      id: 'balance',
      icon: CreditCard,
      title: 'Account Balance',
      description: 'View your current balance, due dates, payment history, and data usage for your postpaid account.',
      color: 'from-green-500 to-green-600',
      hoverColor: 'hover:from-green-600 hover:to-green-700'
    },
    {
      id: 'call',
      icon: Phone,
      title: 'AI Voice Call',
      description: 'Connect with our AI assistant via real-time voice call for hands-free, personalized support.',
      color: 'from-red-500 to-red-600',
      hoverColor: 'hover:from-red-600 hover:to-red-700'
    }
  ];

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50">
        {/* Welcome Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">PLDT Support Portal</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="text-center space-y-4 mb-12">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-gray-200 mb-4">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-700">AI-Powered Support</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Welcome to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-purple-600">
                PLDT Support
              </span>
            </h2>
            
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Choose the service you need below. Our AI-powered platform is here to help you 24/7 with all your inquiries.
            </p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 border-2 hover:border-gray-300 bg-white/80 backdrop-blur-sm overflow-hidden"
                  onClick={() => handleFeatureSelect(feature.id)}
                >
                  <CardHeader className="space-y-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {feature.title}
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600 mt-2 leading-relaxed">
                        {feature.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className={`w-full bg-gradient-to-r ${feature.color} ${feature.hoverColor} text-white shadow-md transition-all duration-300 group-hover:shadow-lg`}
                      size="lg"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">All Systems Operational</span>
              </div>
              <div className="hidden sm:block w-px h-6 bg-gray-300"></div>
              <span className="text-sm text-gray-600">Available 24/7 • Powered by AI</span>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-16 py-8 border-t border-gray-200 bg-white/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
            <p>© 2026 PLDT. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header Section */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  PLDT Support Portal
                </h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  AI-powered customer service platform
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowWelcome(true)}
              className="text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full space-y-6">
          {/* Tabs Navigation */}
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-2 bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="chat" 
              className="flex items-center gap-2 justify-center data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-200 py-3 px-4 rounded-lg border border-gray-200"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Chat Support</span>
              <span className="sm:hidden">Chat</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="tickets" 
              className="flex items-center gap-2 justify-center data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-200 py-3 px-4 rounded-lg border border-gray-200"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Tickets</span>
              <span className="sm:hidden">Tickets</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="balance" 
              className="flex items-center gap-2 justify-center data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-200 py-3 px-4 rounded-lg border border-gray-200"
            >
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Balance</span>
              <span className="sm:hidden">Balance</span>
            </TabsTrigger>
            
            <TabsTrigger 
              value="call" 
              className="flex items-center gap-2 justify-center data-[state=active]:bg-white data-[state=active]:shadow-md hover:bg-white/50 transition-all duration-200 py-3 px-4 rounded-lg border border-gray-200"
            >
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">AI Call</span>
              <span className="sm:hidden">Call</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Content Sections */}
          <TabsContent value="chat" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <h2 className="text-xl font-semibold text-gray-900">Chat with AI Assistant</h2>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                  Get instant help from our AI-powered assistant. Ask about billing, technical issues, or plans.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <ChatContainer />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <h2 className="text-xl font-semibold text-gray-900">Support Tickets</h2>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                  Create and track support tickets for issues that need follow-up or documentation.
                </p>
              </div>
              <TicketManager />
            </div>
          </TabsContent>

          <TabsContent value="balance" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <h2 className="text-xl font-semibold text-gray-900">Account Balance</h2>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                  View your current balance, due dates, and data usage for your postpaid account.
                </p>
              </div>
              <BalanceDisplay />
            </div>
          </TabsContent>

          <TabsContent value="call" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="space-y-4">
              <div className="text-center space-y-2 py-4">
                <h2 className="text-xl font-semibold text-gray-900">AI Voice Call</h2>
                <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                  Connect with our AI assistant via real-time voice call for hands-free support.
                </p>
              </div>
              <AICallCenter />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-16 py-8 border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p>© 2026 PLDT. All rights reserved. | Powered by AI</p>
        </div>
      </footer>
    </div>
  );
}

export default App
