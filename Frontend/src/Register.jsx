import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate, Link } from "react-router-dom";
import ContinueWithGoogle from "./components/ContinueWithGoogle";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "./Auth.css";

const Register = () => {
  const BASE_URL = "http://localhost:4000" // "https://jai-drive.onrender.com";

  const [formData, setFormData] = useState({
    name: "Meet Rana",
    email: "meet@gmail.com",
    password: "abcd",
  });

  // serverError will hold the error message from the server

  const [isSuccess, setIsSuccess] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpTimer, setOtpTimer] = useState(300);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  useEffect(() => {
    let interval;

    if (showOtpInput) {
      setOtpTimer(300); // reset to 5 min every time modal opens
      interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval); // cleanup
  }, [showOtpInput]);

  // Handler for input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSuccess(false); // reset success
  
    try {
      const response = await fetch(`${BASE_URL}/user/register`, {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
  
      if (data.error) {
        // Show toast error instead of setting serverError state
        toast.error(data.error); // example: "Email already exists"
      } else {
        // Show success toast
        toast.success("Registered successfully!");
  
        setIsSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  

  const handleEmailVerify = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`${BASE_URL}/auth/send-otp`, {
        method: "POST",
        body: JSON.stringify({ email: formData.email }),
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
  
      if (data.success) {
        setShowOtpInput(true);
        toast.success("OTP sent successfully 📧");
      } else {
        toast.error(data.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      toast.error("Something went wrong while sending OTP ❌");
    } finally {
      setIsVerifying(false);
    }
  };
  

  const handleVerifyOtp = async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/verify-otp`, {
        method: "POST",
        body: JSON.stringify({ otp }),
        headers: { "Content-Type": "application/json" },
      });
  
      const data = await response.json();
  
      if (data.verified) {
        setIsEmailVerified(true);
        setShowOtpInput(false);
        toast.success("OTP verified successfully ✅");
      } else {
        toast.error("OTP is incorrect ❌");
      }
    } catch (error) {
      console.error("OTP verify error:", error);
      toast.error("Something went wrong while verifying OTP");
    }
  };

  return (
    <div className="container">
      <h2 className="heading">Register</h2>
      <form className="form" onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label htmlFor="name" className="label">
            Name
          </label>
          <input
            className="input"
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your name"
            required
          />
        </div>

        {/* Email */}
        <div className="form-group">
          <label htmlFor="email" className="label">
            Email
          </label>

          <div className="input-wrapper">
            <input
              className="input"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            <button
              type="button"
              className="verify-btn"
              onClick={handleEmailVerify}
              disabled={isEmailVerified || isVerifying}
            >
              {isEmailVerified ? "✅ Verified" : isVerifying ? "Verifying..." : "Verify"}
            </button>
            {showOtpInput && (
              <div className="otp-modal">
                <div className="otp-box">
                  <h3>Enter OTP</h3>
                  <input
                    className="otp-input"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                  />
                  <p style={{ fontSize: "0.85rem", color: otpTimer === 30 ? "red" : "green" }}>
                    {otpTimer === 0 ? "OTP expired" : `OTP expires in ${formatTime(otpTimer)}`}
                  </p>
                  <div>
                    <button type="button" className="modal-btn" onClick={handleVerifyOtp} disabled={otpTimer === 0}>
                      Verify OTP
                    </button>
                    <button type="button" className="modal-btn cancel" onClick={() => setShowOtpInput(false)}>
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>


        {/* Password */}
        <div className="form-group">
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            className="input"
            type={showPassword ? "text" : "password"}
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
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

        <button
          type="submit"
          className={`submit-button ${isSuccess ? "success" : ""}`}
          disabled={!isEmailVerified}
        >
          {isSuccess ? "Registration Successful" : "Register"}
        </button>
      </form>

       {/* Separator */}
    <div className="separator">
      <div className="line" />
      <span className="or-text">or</span>
      <div className="line" />
    </div>

    <ContinueWithGoogle type="register" />

      {/* Link to the login page */}
      <p className="link-text">
        Already have an account? <Link to="/login">Login</Link>
      </p>

      <ToastContainer position="top-right" autoClose={3000} />

    </div>
    
  );
};

export default Register;
