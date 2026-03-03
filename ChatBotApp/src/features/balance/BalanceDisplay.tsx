import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { balanceApi } from '../../lib/api';

interface Balance {
  account_number: string;
  current_balance: number;
  due_date: string | null;
  last_payment_amount: number | null;
  last_payment_date: string | null;
  plan_name: string | null;
  monthly_fee: number | null;
  data_usage_gb: number;
  data_limit_gb: number | null;
  status: string;
  updated_at: string;
}

export const BalanceDisplay: React.FC = () => {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadBalance = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceApi.get();
      setBalance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load balance');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await balanceApi.refresh();
      setBalance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to refresh balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBalance();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'suspended': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP'
    }).format(amount);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-PH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string | null) => {
    if (!dueDate) return null;
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const dataPercentage = balance && balance.data_limit_gb
    ? (balance.data_usage_gb / balance.data_limit_gb) * 100
    : 0;

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={loadBalance}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading && !balance) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          Loading balance information...
        </CardContent>
      </Card>
    );
  }

  if (!balance) {
    return null;
  }

  const daysUntilDue = getDaysUntilDue(balance.due_date);

  return (
    <div className="space-y-4 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-bold">Postpaid Balance</h2>
        <Button onClick={handleRefresh} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
            <div className="flex-1">
              <CardTitle className="text-base sm:text-lg">Account: {balance.account_number}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                {balance.plan_name || 'Postpaid Plan'} • Last updated: {formatDate(balance.updated_at)}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(balance.status)}>
              {balance.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Balance */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 sm:p-6">
            <div className="text-sm opacity-90 mb-1">Current Balance</div>
            <div className="text-3xl sm:text-4xl font-bold mb-2">
              {formatCurrency(balance.current_balance)}
            </div>
            {balance.due_date && (
              <div className="text-sm">
                Due: {formatDate(balance.due_date)}
                {daysUntilDue !== null && (
                  <span className={daysUntilDue <= 7 ? 'font-bold ml-2' : 'ml-2'}>
                    ({daysUntilDue > 0 ? `${daysUntilDue} days left` : 'OVERDUE'})
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Plan Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600 mb-1">Monthly Fee</div>
              <div className="text-xl font-semibold">
                {balance.monthly_fee ? formatCurrency(balance.monthly_fee) : 'N/A'}
              </div>
            </div>
            
            <div className="border rounded p-4">
              <div className="text-sm text-gray-600 mb-1">Last Payment</div>
              <div className="text-xl font-semibold">
                {balance.last_payment_amount ? formatCurrency(balance.last_payment_amount) : 'N/A'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {formatDate(balance.last_payment_date)}
              </div>
            </div>
          </div>

          {/* Data Usage */}
          <div className="border rounded p-4">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-gray-600">Data Usage</div>
              <div className="text-sm font-semibold">
                {balance.data_usage_gb.toFixed(2)} GB 
                {balance.data_limit_gb && ` / ${balance.data_limit_gb} GB`}
              </div>
            </div>
            
            {balance.data_limit_gb && (
              <>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      dataPercentage >= 90 ? 'bg-red-500' :
                      dataPercentage >= 75 ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(dataPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {dataPercentage.toFixed(1)}% used
                </div>
              </>
            )}
          </div>

          {/* Warning for overdue */}
          {daysUntilDue !== null && daysUntilDue <= 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <div className="text-sm text-red-800 font-semibold">
                ⚠️ Your payment is overdue! Please settle your balance to avoid service interruption.
              </div>
            </div>
          )}

          {/* Warning for upcoming due date */}
          {daysUntilDue !== null && daysUntilDue > 0 && daysUntilDue <= 7 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <div className="text-sm text-yellow-800">
                📅 Payment due in {daysUntilDue} days. Pay early to avoid penalties.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
