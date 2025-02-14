import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import bask from "./Photos/img2.jpg";
import img from "./Photos/logo.png";
import { Link, useNavigate } from "react-router-dom";

function Login({ onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);  // <-- Added state for password visibility
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }
    if (hasError) return;

    try {
      const response = await fetch("http://localhost:5005/SignIn", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.message.toLowerCase().includes("email")) setEmailError(data.message);
        else setPasswordError(data.message);
        return;
      }

      localStorage.setItem("token", data.token);
      console.log(data.token);
      navigate("/dashboard");
    } catch (err) {
      setPasswordError("Something went wrong. Try again later.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl flex flex-col md:flex-row relative">
        {/* Left Side Image */}
        <div className="md:w-1/2 hidden md:block">
          <img src={bask} alt="Farm Fresh" className="w-full h-full object-cover rounded-l-lg" />
        </div>

        {/* Right Side - Login Form */}
        <div className="md:w-1/2 w-full p-6 flex flex-col">
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-4">
            <img src={img} alt="Farm2Bag Logo" className="h-10" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-center mb-2">Welcome Back!</h2>
          <p className="text-center text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-green-500 font-semibold">Create Account</Link>
          </p>

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Email Field */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:border-green-500"
                required
              />
              <div className="text-red-500 text-sm min-h-[20px]">{emailError}</div>
            </div>

            {/* Password Field */}
            <div className="mt-4 relative">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type={showPassword ? "text" : "password"}  // <-- Toggle between text & password
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:border-green-500 pr-10"
                required
              />
              {/* Eye Icon Button for toggling password */}
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <div className="text-red-500 text-sm min-h-[20px]">{passwordError}</div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full mt-5 bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
