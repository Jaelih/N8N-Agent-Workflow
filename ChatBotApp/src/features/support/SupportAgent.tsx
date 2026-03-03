import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, Mic, MicOff, Send } from 'lucide-react';
import { designTokens } from '../../design-system/tokens';
import { callApi, api } from '../../lib/api';
import type { Message } from '../../types';
import MessageBubble from '../../components/MessageBubble';
import TypingIndicator from '../../components/TypingIndicator';
import { RadialVisualization } from './RadialVisualization';

type AgentState = 'ready' | 'typing' | 'calling' | 'in-call';

export const SupportAgent: React.FC = () => {
  // Unified state management
  const [agentState, setAgentState] = useState<AgentState>('ready');
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'active' | 'ending'>('idle');
  const [sessionId, setSessionId] = useState<string>(() => `session_${Math.random().toString(36).substr(2, 9)}`);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [messageInput]);

  // Start call
  const startCall = async () => {
    setCallState('connecting');
    setAgentState('calling');
    setError(null);

    try {
      const { session_id, ws_url, ephemeral_token } = await callApi.initiate();
      setSessionId(session_id);

      const wsUrl = `ws://127.0.0.1:8000${ws_url}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        setCallState('active');
        setAgentState('in-call');
        setCallDuration(0);
        
        timerRef.current = window.setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);

        ws.send(JSON.stringify({ type: 'connect', ephemeral_token }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        if (message.type === 'error') {
          setError(message.message);
          endCall();
        }
      };

      ws.onerror = () => {
        setError('Connection error');
        setCallState('idle');
        setAgentState('ready');
      };

      ws.onclose = () => {
        setCallState('idle');
        setAgentState('ready');
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };

      wsRef.current = ws;
    } catch (err) {
      setError('Failed to initiate call');
      setCallState('idle');
      setAgentState('ready');
    }
  };

  // End call
  const endCall = async () => {
    setCallState('ending');

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (sessionId) {
      try {
        await callApi.end(sessionId);
      } catch (err) {
        // Silent fail - already handled by UI
      }
    }

    setTimeout(() => {
      setCallState('idle');
      setAgentState('ready');
    }, 500);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  // Send message
  const handleSendMessage = async () => {
    const content = messageInput.trim();
    if (!content) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setMessageInput('');
    setIsTyping(true);
    setAgentState('typing');

    try {
      const data = await api.sendMessage(content, sessionId);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
      setAgentState('ready');
    }
  };

  // Handle keyboard
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get state badge
  const getStateBadge = () => {
    const styles = {
      ready: { bg: designTokens.colors.semantic.success, text: 'Ready' },
      typing: { bg: designTokens.colors.pldt.red, text: 'Typing...' },
      calling: { bg: designTokens.colors.semantic.warning, text: 'Connecting...' },
      'in-call': { bg: designTokens.colors.semantic.error, text: `In Call ${formatDuration(callDuration)}` },
    };
    
    const style = styles[agentState];
    
    return (
      <div 
        className="px-4 py-1.5 rounded-full text-sm font-medium text-white"
        style={{ backgroundColor: style.bg }}
      >
        {style.text}
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-white flex flex-col lg:flex-row overflow-hidden">
      {/* Left Panel - Call Visualization */}
      <div 
        className="w-full lg:w-[40%] flex-shrink-0 flex flex-col items-center justify-center relative lg:h-full min-h-[400px] lg:min-h-0 overflow-hidden"
        style={{ backgroundColor: designTokens.colors.neutral.gray50 }}
      >
        {/* Radial Visualization */}
        <div className="flex-1 flex items-center justify-center w-full px-4 py-8 lg:py-0">
          <RadialVisualization status={callState} duration={callDuration} />
        </div>

        {/* Call Button */}
        <div className="flex-shrink-0 z-20">
          <button
            onClick={callState === 'idle' ? startCall : endCall}
            disabled={callState === 'connecting' || callState === 'ending'}
            className="call-button group relative"
            style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              background: callState === 'idle' || callState === 'connecting'
                ? designTokens.gradients.linearActive
                : designTokens.colors.semantic.error,
              boxShadow: callState === 'active' 
                ? designTokens.shadows.glowActive
                : designTokens.shadows.lg,
              transition: `all ${designTokens.animation.duration.normal} ${designTokens.animation.easing.smooth}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              cursor: callState === 'connecting' || callState === 'ending' ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={(e) => {
              if (callState === 'idle') {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = designTokens.shadows.glow;
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = callState === 'active' 
                ? designTokens.shadows.glowActive
                : designTokens.shadows.lg;
            }}
          >
            {callState === 'idle' || callState === 'connecting' ? (
              <Phone size={36} color="white" strokeWidth={2} />
            ) : (
              <PhoneOff size={36} color="white" strokeWidth={2} />
            )}
          </button>

          {/* Pulse ring for idle state */}
          {callState === 'idle' && (
            <div 
              className="absolute inset-0 rounded-full animate-ping opacity-20 pointer-events-none"
              style={{
                background: designTokens.colors.pldt.red,
                animationDuration: '2s',
              }}
            />
          )}
        </div>

        {/* Mute Button */}
        <div className="mb-6 lg:mb-12 flex-shrink-0 z-20 flex justify-center">
          <button
            onClick={toggleMute}
            disabled={callState !== 'active'}
            className="mt-4 lg:mt-6"
            style={{
              width: '56px',
              height: '56px',
              borderRadius: designTokens.radius.full,
              backgroundColor: isMuted 
                ? designTokens.colors.pldt.red 
                : designTokens.colors.neutral.white,
              boxShadow: designTokens.shadows.md,
              border: `2px solid ${isMuted ? designTokens.colors.pldt.red : designTokens.colors.neutral.gray300}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: callState === 'active' ? 'pointer' : 'not-allowed',
              opacity: callState === 'active' ? 1 : 0.4,
              transition: `all ${designTokens.animation.duration.fast}`,
            }}
            onMouseEnter={(e) => {
              if (callState === 'active') {
                e.currentTarget.style.transform = 'translateY(-2px)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {isMuted ? (
              <MicOff size={24} color="white" strokeWidth={2} />
            ) : (
              <Mic size={24} color={designTokens.colors.neutral.gray700} strokeWidth={2} />
            )}
          </button>
        </div>

        {/* Error notification */}
        {error && (
          <div 
            className="absolute top-8 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl max-w-sm z-30"
            style={{
              backgroundColor: designTokens.colors.neutral.white,
              boxShadow: designTokens.shadows.lg,
              border: `1px solid ${designTokens.colors.semantic.error}`,
            }}
          >
            <p style={{ color: designTokens.colors.semantic.error }} className="text-sm font-medium">
              {error}
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Chat Interface */}
      <div className="w-full lg:w-[60%] flex-1 lg:flex-shrink-0 flex flex-col lg:h-full overflow-hidden">
        {/* Header */}
        <div 
          className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 flex-shrink-0"
          style={{ 
            borderColor: designTokens.colors.neutral.gray200,
            backgroundColor: designTokens.colors.neutral.white,
          }}
        >
          <div>
            <h2 
              className="text-lg sm:text-xl lg:text-2xl font-bold"
              style={{ color: designTokens.colors.neutral.charcoal }}
            >
              Support Agent
            </h2>
            <p 
              className="text-xs sm:text-sm mt-0.5"
              style={{ color: designTokens.colors.neutral.gray600 }}
            >
              Session: {sessionId.slice(-8)}
            </p>
          </div>
          {getStateBadge()}
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6 min-h-0" style={{ backgroundColor: designTokens.colors.neutral.gray50 }}>
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div 
                  className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                  style={{ backgroundColor: designTokens.colors.alpha.redLight }}
                >
                  <Phone size={32} color={designTokens.colors.pldt.red} strokeWidth={2} />
                </div>
                <h3 
                  className="text-xl font-semibold mb-3"
                  style={{ color: designTokens.colors.neutral.charcoal }}
                >
                  How can we help you today?
                </h3>
                <p 
                  className="text-base mb-8"
                  style={{ color: designTokens.colors.neutral.gray600 }}
                >
                  Send a message or start a call to connect with our support team.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {['Check service status', 'Billing inquiry', 'Technical support', 'Plan upgrade'].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setMessageInput(suggestion);
                        textareaRef.current?.focus();
                      }}
                      className="px-5 py-3 rounded-xl text-left transition-all"
                      style={{
                        backgroundColor: designTokens.colors.neutral.white,
                        border: `1px solid ${designTokens.colors.neutral.gray200}`,
                        color: designTokens.colors.neutral.gray700,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = designTokens.colors.alpha.redLight;
                        e.currentTarget.style.borderColor = designTokens.colors.pldt.red;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = designTokens.colors.neutral.white;
                        e.currentTarget.style.borderColor = designTokens.colors.neutral.gray200;
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6 border-t flex-shrink-0" style={{ borderColor: designTokens.colors.neutral.gray200 }}>
          <div 
            className="relative flex items-end gap-3"
            style={{
              backgroundColor: designTokens.colors.neutral.white,
              borderRadius: designTokens.radius['2xl'],
              border: `2px solid ${designTokens.colors.neutral.gray200}`,
              padding: '12px',
              transition: `all ${designTokens.animation.duration.fast}`,
            }}
          >
            <textarea
              ref={textareaRef}
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="flex-1 bg-transparent px-2 py-2 text-base outline-none resize-none max-h-32"
              style={{
                color: designTokens.colors.neutral.charcoal,
                fontFamily: designTokens.typography.fontFamily.sans,
              }}
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className="flex-shrink-0"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: designTokens.radius.full,
                backgroundColor: messageInput.trim() 
                  ? designTokens.colors.pldt.red 
                  : designTokens.colors.neutral.gray300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: messageInput.trim() ? 'pointer' : 'not-allowed',
                transition: `all ${designTokens.animation.duration.fast}`,
                border: 'none',
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (messageInput.trim()) {
                  e.currentTarget.style.backgroundColor = designTokens.colors.pldt.redDark;
                  e.currentTarget.style.transform = 'scale(1.05)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = messageInput.trim() 
                  ? designTokens.colors.pldt.red 
                  : designTokens.colors.neutral.gray300;
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <Send size={20} color="white" strokeWidth={2} />
            </button>
          </div>
          <p 
            className="text-xs mt-3 text-center"
            style={{ color: designTokens.colors.neutral.gray500 }}
          >
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};
