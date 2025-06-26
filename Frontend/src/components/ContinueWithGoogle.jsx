import { useGoogleLogin } from "@react-oauth/google";
import "./ContinueWithGoogle.css";
import { Link, useNavigate } from "react-router-dom";

const BASE_URL = "http://localhost:4000"; // "https://jai-drive.onrender.com";


const continueWithGoogle = () => {

  const navigate = useNavigate();

  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {

      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      const userInfo = await response.json();

      const loggeedInResponse = await fetch(`${BASE_URL}/user/google/auth`, {
        method: "POST",
        body: JSON.stringify({
          email: userInfo.email,
          name: userInfo.name,
          picture: userInfo.picture,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if(loggeedInResponse) {
        const data = await loggeedInResponse.json();
        navigate("/");
      }
      else {
        console.error("Failed to log in with Google");
      }

    },
    onError: () => {
      console.log("Login Failed");
    },
  });

  return (
    <button className="google-button" onClick={() => login()}>
      <img
        src="https://developers.google.com/identity/images/g-logo.png"
        alt="Google"
        className="google-icon"
      />
      Continue with Google
    </button>
  );
};

export default continueWithGoogle;
