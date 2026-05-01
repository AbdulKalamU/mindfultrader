import React, { useState, useEffect } from 'react';
import { walletApi } from '../services/api';
import { Wallet as WalletIcon, TrendingUp, TrendingDown, DollarSign, Clock } from 'lucide-react';
import type { Wallet } from '../types';

export const WalletPage: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await walletApi.getWallet();
      setWallet(response.wallet);
    } catch (err: any) {
      setError('Failed to load wallet. Please try again.');
      console.error('Wallet fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: wallet?.currency || 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'withdraw':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'trade':
        return <DollarSign className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-400';
      case 'withdraw':
        return 'text-red-400';
      case 'trade':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-lg">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Wallet</h1>
          <p className="text-gray-400">Manage your trading funds</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg p-8 mb-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-2 flex items-center">
                <WalletIcon className="w-4 h-4 mr-2" />
                Available Balance
              </p>
              <h2 className="text-5xl font-bold text-white mb-2">
                {wallet ? formatCurrency(wallet.balance) : '$0.00'}
              </h2>
              <p className="text-blue-100 text-sm">
                {wallet?.currency || 'USD'}
              </p>
            </div>
            <div className="hidden sm:block">
              <WalletIcon className="w-24 h-24 text-white opacity-20" />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <a
            href="/payments"
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 hover:border-green-500/50 hover:bg-slate-800 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-green-400 transition-colors">
                  Add Funds
                </h3>
                <p className="text-sm text-gray-400">Deposit money to your wallet</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-400" />
            </div>
          </a>

          <button
            onClick={() => alert('Withdrawal feature coming soon!')}
            className="bg-slate-900 border border-slate-700 rounded-lg p-6 hover:border-red-500/50 hover:bg-slate-800 transition-all group text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2 group-hover:text-red-400 transition-colors">
                  Withdraw
                </h3>
                <p className="text-sm text-gray-400">Transfer funds to your bank</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-400" />
            </div>
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-gray-100 mb-6 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Recent Transactions
          </h3>

          {wallet?.transactions && wallet.transactions.length > 0 ? (
            <div className="space-y-4">
              {wallet.transactions.map((transaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-slate-800 rounded-lg hover:bg-slate-750 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-slate-700 rounded-lg">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-100 capitalize">
                        {transaction.type}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatDate(transaction.date)}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {transaction.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`text-lg font-semibold ${getTransactionColor(transaction.type)}`}>
                    {transaction.type === 'withdraw' ? '-' : '+'}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-2">No transactions yet</p>
              <p className="text-sm text-gray-500">Your transaction history will appear here</p>
            </div>
          )}

          {wallet?.transactionCount && wallet.transactionCount > 20 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Showing last 20 of {wallet.transactionCount} transactions
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
