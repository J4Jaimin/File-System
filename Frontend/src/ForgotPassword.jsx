import React, { useState } from 'react';
import { toast } from "react-toastify";
import { useParams, useNavigate } from 'react-router-dom';
import {FaEye, FaEyeSlash} from "react-icons/fa";
import './Auth.css';

const ForgotPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

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
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
            <span
              onClick={() => setShowPassword((prev) => !prev)}
              style={{
                position: "absolute",
                right: "10px",
                top: "30px",
                cursor: "pointer",
                userSelect: "none"
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={0}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </span>
          </div>

          <div className="form-group">
            <label className="label" htmlFor="confirmPassword">Confirm Password</label>
            <input
              className="input"
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
              required
            />
          </div>

          <button className="submit-button" type="submit">Reset Password</button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
