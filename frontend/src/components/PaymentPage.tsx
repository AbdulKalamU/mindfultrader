import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { walletApi } from '../services/api';
import { CreditCard, Smartphone, Bitcoin, CheckCircle, AlertCircle } from 'lucide-react';

type PaymentMethod = 'card' | 'upi' | 'crypto';

export const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      setProcessing(true);
      setError('');

      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Call deposit API
      await walletApi.deposit(parsedAmount, `Mock ${paymentMethod} deposit`);

      setSuccess(true);
      
      // Redirect to wallet after 2 seconds
      setTimeout(() => {
        navigate('/wallet');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard, description: 'Visa, Mastercard, Amex' },
    { id: 'upi', name: 'UPI', icon: Smartphone, description: 'Google Pay, PhonePe, Paytm' },
    { id: 'crypto', name: 'Cryptocurrency', icon: Bitcoin, description: 'BTC, ETH, USDT' },
  ];

  const quickAmounts = [100, 500, 1000, 5000];

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="mb-6">
            <CheckCircle className="w-24 h-24 text-green-400 mx-auto animate-bounce" />
          </div>
          <h2 className="text-3xl font-bold text-gray-100 mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-4">Your wallet has been credited with ${amount}</p>
          <p className="text-sm text-gray-500">Redirecting to wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Add Funds</h1>
          <p className="text-gray-400">Choose your payment method and amount</p>
          <div className="mt-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-yellow-300">
                <strong>Demo Mode:</strong> This is a mock payment system. No real transactions will be processed.
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount Input */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Enter Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl text-gray-400">$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
                className="w-full pl-12 pr-4 py-4 text-3xl font-bold bg-slate-800 border border-slate-600 rounded-lg text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="mt-4 grid grid-cols-4 gap-2">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-slate-700 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
            <label className="block text-sm font-medium text-gray-300 mb-4">
              Select Payment Method
            </label>
            <div className="space-y-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id as PaymentMethod)}
                    className={`w-full flex items-center p-4 rounded-lg border-2 transition-all ${
                      paymentMethod === method.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <div className={`p-2 rounded-lg ${
                      paymentMethod === method.id ? 'bg-blue-500/20' : 'bg-slate-700'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        paymentMethod === method.id ? 'text-blue-400' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="ml-4 text-left flex-1">
                      <p className={`font-medium ${
                        paymentMethod === method.id ? 'text-blue-400' : 'text-gray-100'
                      }`}>
                        {method.name}
                      </p>
                      <p className="text-sm text-gray-400">{method.description}</p>
                    </div>
                    {paymentMethod === method.id && (
                      <CheckCircle className="w-6 h-6 text-blue-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={processing || !amount}
            className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-950 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {processing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </span>
            ) : (
              `Pay $${amount || '0.00'}`
            )}
          </button>

          {/* Cancel Button */}
          <button
            type="button"
            onClick={() => navigate('/wallet')}
            disabled={processing}
            className="w-full px-6 py-3 bg-slate-800 border border-slate-600 text-gray-300 font-medium rounded-lg hover:bg-slate-700 hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};
