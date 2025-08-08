import React, { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Link } from "react-router-dom";
import "./Auth.css";

const ResetPassword = () => {
  const BASE_URL = "http://localhost:4000";

  const [email, setEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Link to reset password has been sent to your mail id.");
      } else {
        toast.error(data.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("reset Password Error:", err);
      toast.error("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-card">
        <h2 className="heading">Forgot Password</h2>

        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <input
              className="input"
              type="email"
              id="email"
              name="email"
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="submit-button" onClick={handleSubmit}>
            Send Reset Link
          </button>
        </form>

        <p className="link-text">
          Go back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
