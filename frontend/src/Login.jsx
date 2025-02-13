import React, { useState } from "react";
import { X } from "lucide-react";
import bask from "./Photos/img2.jpg"
import img from "./Photos/logo.png"
function Login({ onClose }) {
  const [loginMethod, setLoginMethod] = useState("otp");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl flex flex-col md:flex-row relative">
        
        <div className="md:w-1/2 hidden md:block">
          <img
            src={bask}
            alt="Farm Fresh"
            className="w-screen h-full object-cover rounded-l-lg"
          />
        </div>

        <div className="md:w-1/2 w-full p-6 flex flex-col">
          
          
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>

          
          <div className="flex justify-center mb-4">
            <img src={img} alt="Farm2Bag Logo" className="h-10" />
          </div>

        
          <h2 className="text-2xl font-bold text-center mb-2">Welcome Back!</h2>
          <p className="text-center text-gray-600">
            Don’t have an account? <a href="#" className="text-green-500 font-semibold">Create Account</a>
          </p>

           <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
            <input
              type="text"
              placeholder="Enter your mobile number"
              className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:border-green-500"
            />
          </div>

           <div className="mt-3 flex items-center space-x-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="loginMethod"
                value="otp"
                checked={loginMethod === "otp"}
                onChange={() => setLoginMethod("otp")}
                className="mr-2"
              />
              Login with OTP
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="loginMethod"
                value="pin"
                checked={loginMethod === "pin"}
                onChange={() => setLoginMethod("pin")}
                className="mr-2"
              />
              Login with PIN
            </label>
          </div>

           <button className="w-full mt-5 bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition">
            Sign In
          </button>

        </div>
      </div>
    </div>
  );
}

export default Login;
