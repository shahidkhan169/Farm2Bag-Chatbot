import React from "react";
import { X } from "lucide-react";
import farm from "./Photos/img3.jpg"
import img from "./Photos/logo.png"

function Register({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center px-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl flex flex-col md:flex-row relative">
        
        <div className="md:w-1/2 hidden md:block relative">
          <img
            src={farm}  
            alt="Farm2Bag"
            className="w-full h-full object-cover rounded-l-lg"
          />
          {/* <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-center text-white p-4">
            <h2 className="text-3xl font-bold">FARM2BAG</h2>
            <p className="text-lg italic">Always Fresh & Organic</p>
          </div> */}
        </div>

        <div className="md:w-1/2 w-full p-6 flex flex-col">
          

          <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>


          <div className="flex justify-center mb-4">
            <img src={img} alt="Farm2Bag Logo" className="h-10" />
          </div>

          <h2 className="text-2xl font-bold text-center mb-2">Sign Up for Free!</h2>
          <p className="text-center text-gray-600">
            Already registered? <a href="#" className="text-green-500 font-semibold">Sign In Now</a>
          </p>

          <div className="mt-4 space-y-3">
            <input
              type="text"
              placeholder="Name"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-green-500"
            />
            <input
              type="email"
              placeholder="Email Address"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-green-500"
            />
            <input
              type="text"
              placeholder="Mobile Number"
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-green-500"
            />
          </div>

          <p className="text-xs text-gray-500 mt-2 text-center">
            Privacy and policy
          </p>

        
          <button className="w-full mt-4 bg-green-500 text-white font-semibold py-2 rounded-md hover:bg-green-600 transition">
            Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
