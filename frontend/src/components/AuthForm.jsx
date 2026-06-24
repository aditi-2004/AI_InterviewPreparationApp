import React, { useState } from 'react';
import { authAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const AuthForm = ({ mode, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (mode === 'signup') {
        response = await authAPI.signup(formData);
      } else {
        response = await authAPI.login({
          email: formData.email,
          password: formData.password
        });
      }

      login(response.data.token, response.data.user);
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h2 className="text-2xl font-bold text-center text-slate-800">
          {mode === 'signup' ? 'Create Account' : 'Welcome Back'}
        </h2>
        
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold p-4 rounded-xl shadow-sm">
            {error}
          </div>
        )}
        
        {mode === 'signup' && (
          <div className="flex flex-col gap-2">
            <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150"
            />
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150"
          />
        </div>
        
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="••••••••"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200/80 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition duration-150"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-md shadow-indigo-100 hover:shadow-lg hover:shadow-indigo-200 transition duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          {loading ? 'Processing...' : (mode === 'signup' ? 'Sign Up' : 'Login')}
        </button>
      </form>
    </div>
  );
};

export default AuthForm;