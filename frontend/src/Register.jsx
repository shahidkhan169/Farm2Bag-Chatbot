import React, { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import farm from "./Photos/img3.jpg";
import img from "./Photos/logo.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Register({ onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    rePassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error when typing
  };

  // Validate form fields
  const validateForm = () => {
    let newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Mobile number is required";
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.rePassword) newErrors.rePassword = "Confirm password is required";
    if (formData.password !== formData.rePassword) newErrors.rePassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);

    if (!validateForm()) return;

    try {
      const response = await axios.post("http://localhost:5005/Signup", formData);
      setMessage(response.data.message);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setErrors({ general: err.response?.data?.message || "Something went wrong." });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl flex flex-col md:flex-row relative">
        
        <div className="md:w-1/2 hidden md:block relative">
          <img src={farm} alt="Farm2Bag" className="w-full h-full object-cover rounded-l-lg" />
        </div>

        <div className="md:w-1/2 w-full p-6 flex flex-col relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>

          <div className="flex justify-center mb-4">
            <img src={img} alt="Farm2Bag Logo" className="h-10" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Sign Up for Free!</h2>
          <p className="text-center text-gray-600">
            Already registered? <Link to="/login" className="text-green-500 font-semibold"> Sign In Now</Link>
          </p>

          {message && <p className="text-green-500 text-sm text-center mt-2">{message}</p>}
          {errors.general && <p className="text-red-500 text-sm text-center mt-2">{errors.general}</p>}

          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            {/* Name Field */}
            <div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-green-500 ${errors.name ? "border-red-500" : ""}`}
              />
              <p className="text-red-500 text-xs h-4">{errors.name}</p>
            </div>

            {/* Email Field */}
            <div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-green-500 ${errors.email ? "border-red-500" : ""}`}
              />
              <p className="text-red-500 text-xs h-4">{errors.email}</p>
            </div>

            {/* Phone Number Field */}
            <div>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="Mobile Number"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-green-500 ${errors.phoneNumber ? "border-red-500" : ""}`}
              />
              <p className="text-red-500 text-xs h-4">{errors.phoneNumber}</p>
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-green-500 ${errors.password ? "border-red-500" : ""}`}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-gray-500">
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <p className="text-red-500 text-xs h-4">{errors.password}</p>
            </div>

            {/* Confirm Password Field */}
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="rePassword"
                value={formData.rePassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-green-500 ${errors.rePassword ? "border-red-500" : ""}`}
              />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-2.5 text-gray-500">
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
              <p className="text-red-500 text-xs h-4">{errors.rePassword}</p>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">Privacy and policy</p>

            <button type="submit" className="w-full mt-4 bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Register;
