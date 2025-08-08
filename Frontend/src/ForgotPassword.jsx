import React, { useState } from 'react';
import { toast } from "react-toastify";
import { useParams, useNavigate } from 'react-router-dom';
import './Auth.css';

const ForgotPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("password do not match.");
      return;
    }

    try {
      const res = await fetch('http://localhost:4000/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      const data = await res.json();

      if(res.ok) {
        toast.success(data.message || 'Password reset successfully');
        setTimeout(() => navigate('/login'), 500);
      }
      else {
        toast.error(data.message || "Something went wrong");
        navigate('/reset-password');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-card">
        <h2 className="heading">Reset Password</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="password">New Password</label>
            <input
              className="input"
              type="password"
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="input"
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          {error && <p className="error-msg">{error}</p>}
          {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}

          <button className="submit-button" type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
