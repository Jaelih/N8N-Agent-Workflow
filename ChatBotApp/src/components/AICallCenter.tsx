import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneCall, PhoneOff } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { callApi } from '../lib/api';

interface CallLog {
  id: string;
  session_id: string;
  call_type: string;
  duration_seconds: number;
  transcript_summary: string | null;
  sentiment: string | null;
  resolved: boolean;
  cost_usd: number;
  started_at: string;
  ended_at: string | null;
}

export const AICallCenter: React.FC = () => {
  const [callState, setCallState] = useState<'idle' | 'connecting' | 'connected' | 'ending'>('idle');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showLogs, setShowLogs] = useState(false);
  
  const wsRef = useRef<WebSocket | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    loadCallLogs();
    return () => {
      // Cleanup on unmount
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const loadCallLogs = async () => {
    try {
      const logs = await callApi.getLogs(10);
      setCallLogs(logs);
    } catch (err) {
      console.error('Failed to load call logs:', err);
    }
  };

  const startCall = async () => {
    setCallState('connecting');
    setError(null);

    try {
      // Initiate call with backend
      const { session_id, ws_url, ephemeral_token } = await callApi.initiate();
      setSessionId(session_id);

      // Connect WebSocket
      const wsUrl = `ws://127.0.0.1:8000${ws_url}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket connected');
        setCallState('connected');
        setCallDuration(0);
        
        // Start duration timer
        timerRef.current = setInterval(() => {
          setCallDuration((prev) => prev + 1);
        }, 1000);

        // Send initial connection message
        ws.send(JSON.stringify({
          type: 'connect',
          ephemeral_token
        }));
      };

      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        console.log('Received:', message);

        if (message.type === 'error') {
          setError(message.message);
          endCall();
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setError('Connection error');
        setCallState('idle');
      };

      ws.onclose = () => {
        console.log('WebSocket closed');
        if (callState === 'connected') {
          setCallState('idle');
        }
      };

      wsRef.current = ws;

    } catch (err: any) {
      console.error('Failed to start call:', err);
      setError(err.message || 'Failed to start call');
      setCallState('idle');
    }
  };

  const endCall = async () => {
    if (!sessionId) return;

    setCallState('ending');

    // Close WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    // Stop timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      // End call on backend
      const summary = await callApi.end(sessionId);
      console.log('Call summary:', summary);
      
      // Reload logs
      await loadCallLogs();
      
      // Show confirmation
      alert(`Call ended successfully!\n\nDuration: ${formatDuration(summary.duration_seconds)}\nCost: $${summary.cost_usd.toFixed(4)}`);
    } catch (err: any) {
      console.error('Failed to end call properly:', err);
    } finally {
      setCallState('idle');
      setSessionId(null);
      setCallDuration(0);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('en-PH', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSentimentColor = (sentiment: string | null) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'bg-green-500';
      case 'negative': return 'bg-red-500';
      case 'neutral': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">AI Call Center</h2>

      {/* Call Interface */}
      <Card>
        <CardHeader>
          <CardTitle>Live Call</CardTitle>
          <CardDescription>
            Connect with our AI agent for real-time assistance
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded p-3 text-sm">
              {error}
            </div>
          )}

          <div className="text-center py-8">
            {callState === 'idle' && (
              <div>
                <div className="mb-4 flex justify-center">
                  <Phone className="w-24 h-24 text-blue-500" />
                </div>
                <Button size="lg" onClick={startCall} className="px-8">
                  Start Call
                </Button>
                <p className="text-sm text-gray-500 mt-2">
                  Click to connect with our AI agent
                </p>
              </div>
            )}

            {callState === 'connecting' && (
              <div>
                <div className="mb-4 flex justify-center">
                  <Phone className="w-24 h-24 text-blue-500 animate-pulse" />
                </div>
                <p className="text-lg">Connecting...</p>
              </div>
            )}

            {callState === 'connected' && (
              <div>
                <div className="mb-4 flex justify-center">
                  <PhoneCall className="w-24 h-24 text-green-500 animate-pulse" />
                </div>
                <Badge className="bg-green-500 text-lg py-2 px-4 mb-4">
                  CALL IN PROGRESS
                </Badge>
                <div className="text-3xl font-mono font-bold mb-6">
                  {formatDuration(callDuration)}
                </div>
                <Button 
                  size="lg" 
                  variant="destructive" 
                  onClick={endCall}
                  className="px-8"
                >
                  End Call
                </Button>
                <div className="mt-4 text-sm text-gray-600">
                  Session ID: {sessionId}
                </div>
              </div>
            )}

            {callState === 'ending' && (
              <div>
                <div className="mb-4 flex justify-center">
                  <PhoneOff className="w-24 h-24 text-red-500" />
                </div>
                <p className="text-lg">Ending call...</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm">
            <strong>Note:</strong> This feature uses WebRTC and OpenAI's Realtime API for live voice communication.
            Ensure your microphone and speakers are enabled. Standard voice call rates apply.
          </div>
        </CardContent>
      </Card>

      {/* Call History */}
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Call History</h3>
        <Button variant="outline" onClick={() => setShowLogs(!showLogs)}>
          {showLogs ? 'Hide' : 'Show'} History
        </Button>
      </div>

      {showLogs && (
        <div className="space-y-3">
          {callLogs.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                No call history yet
              </CardContent>
            </Card>
          ) : (
            callLogs.map((log) => (
              <Card key={log.id}>
                <CardContent className="py-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold">
                        {formatDate(log.started_at)}
                      </div>
                      <div className="text-sm text-gray-600">
                        Duration: {formatDuration(log.duration_seconds)} • 
                        Cost: ${log.cost_usd.toFixed(4)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {log.sentiment && (
                        <Badge className={getSentimentColor(log.sentiment)}>
                          {log.sentiment}
                        </Badge>
                      )}
                      {log.resolved && (
                        <Badge className="bg-green-500">Resolved</Badge>
                      )}
                    </div>
                  </div>
                  {log.transcript_summary && (
                    <div className="text-sm text-gray-700 bg-gray-50 rounded p-2 mt-2">
                      {log.transcript_summary}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};
