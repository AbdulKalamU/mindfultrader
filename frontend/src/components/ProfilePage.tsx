import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { profileApi } from '../services/api';
import { User, Settings, TrendingUp, Shield } from 'lucide-react';
import type { UserProfile, TradingStyle, ExperienceLevel, RiskLevel } from '../types';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form state
  const [username, setUsername] = useState('');
  const [tradingStyle, setTradingStyle] = useState<TradingStyle | ''>('');
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | ''>('');
  const [riskLevel, setRiskLevel] = useState<RiskLevel | ''>('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await profileApi.getProfile();
      setProfile(response.profile);
      
      // Populate form
      setUsername(response.profile.username || '');
      setTradingStyle(response.profile.tradingStyle || '');
      setExperienceLevel(response.profile.experienceLevel || '');
      setRiskLevel(response.profile.riskLevel || '');
    } catch (err: any) {
      setError('Failed to load profile. Please try again.');
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const response = await profileApi.updateProfile({
        username: username || undefined,
        tradingStyle: tradingStyle || undefined,
        experienceLevel: experienceLevel || undefined,
        riskLevel: riskLevel || undefined,
      });

      setProfile(response.profile);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
      console.error('Profile update error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-400 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account and trading preferences</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 rounded-lg bg-green-500/20 border border-green-500/50 p-4">
            <p className="text-sm text-green-400">{success}</p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/20 border border-red-500/50 p-4">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <div className="flex flex-col items-center">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-100 mb-1">
                  {profile?.username || 'Trader'}
                </h2>
                <p className="text-sm text-gray-400 mb-4">{user?.email}</p>
                <div className="w-full pt-4 border-t border-slate-700">
                  <p className="text-xs text-gray-500 mb-1">Member since</p>
                  <p className="text-sm text-gray-300">
                    {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-6 flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Trading Profile
              </h3>

              <div className="space-y-6">
                {/* Username */}
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    maxLength={50}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                {/* Trading Style */}
                <div>
                  <label htmlFor="tradingStyle" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Trading Style
                  </label>
                  <select
                    id="tradingStyle"
                    value={tradingStyle}
                    onChange={(e) => setTradingStyle(e.target.value as TradingStyle)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">Select trading style</option>
                    <option value="Day Trader">Day Trader</option>
                    <option value="Swing Trader">Swing Trader</option>
                    <option value="Scalper">Scalper</option>
                    <option value="Position Trader">Position Trader</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select
                    id="experienceLevel"
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as ExperienceLevel)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">Select experience level</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                    <Shield className="w-4 h-4 mr-1" />
                    Risk Tolerance
                  </label>
                  <select
                    id="riskLevel"
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value as RiskLevel)}
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="">Select risk level</option>
                    <option value="Low">Low - Conservative</option>
                    <option value="Medium">Medium - Balanced</option>
                    <option value="High">High - Aggressive</option>
                    <option value="Very High">Very High - Speculative</option>
                  </select>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
