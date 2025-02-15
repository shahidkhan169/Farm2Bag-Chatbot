import React, { useState, useEffect } from 'react';
import { FaPaperPlane, FaCommentDots, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';
import what from "./Photos/whatsapp.png"

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    }
  }, []);

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (input.trim() !== '') {
      const newMessage = { text: input, sender: 'user' };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInput('');
      setLoading(true);

      try {
        const response = await axios.post('https://bream-dear-physically.ngrok-free.app/query', {
          query: input,
        });

        const data = response.data;

        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.response, sender: 'bot' },
        ]);

        // Simulate loading effect for product results
        setTimeout(() => {
          setLoading(false);
          if (data.results) {
            data.results.forEach((product) => {
              setMessages((prevMessages) => [
                ...prevMessages,
                { text: product.name, sender: 'bot', product },
              ]);
            });
          }
        }, 2000);
      } catch (error) {
        console.error('Error fetching query result:', error);
        setLoading(false);
      }
    }
  };

  const toggleProductDetails = (productName) => {
    setExpandedProduct(expandedProduct === productName ? null : productName);
    if (expandedProduct !== productName) {
      setProductLoading(true);
      setTimeout(() => setProductLoading(false), 1500);
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  return (
    <>
      <div className="fixed bottom-7 right-8 cursor-pointer" onClick={toggleChat}>
        <div className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-black transition-all">
          <FaCommentDots className="w-4 h-4" />
        </div>
      </div>

      {isChatOpen && (
        <div className="fixed right-8 bottom-20 w-96 h-[540px] border border-gray-300 shadow-lg rounded-lg flex flex-col mr-3 mb-0">

          <div className="bg-slate-800 text-white text-center py-3 rounded-t-lg font-bold">

            Fairos
          </div>

          <div className="flex-1 overflow-y-auto p-3 text-gray-200 space-y-2  bg-gradient-to-r from-blue-500 via-purple-500
               to-pink-500">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-2 rounded max-w-full break-words whitespace-normal ${msg.sender === 'user' ? 'bg-slate-800 text-white' : 'bg-orange-600 text-white'}`}>
                  {msg.text}
                </div>
                {msg.product && (
                  <div className="w-full mt-2">
                    <div className="flex justify-between items-center">
                      <button className="text-blue-500 flex items-center" onClick={() => toggleProductDetails(msg.product.name)}>
                        <FaChevronDown className={`w-4 h-4 ${expandedProduct === msg.product.name ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    {expandedProduct === msg.product.name && (
                      <div className="mt-2 text-sm text-gray-300 overflow-y-auto max-h-48">
                        {productLoading ? (
                          <div className="text-center text-gray-400">Loading details...</div>
                        ) : (
                          <>
                            <p><strong>Category:</strong> {msg.product.category}</p>
                            <p><strong>Price:</strong> {msg.product.price}</p>
                            <p><strong>Weight:</strong> {msg.product.weight} {msg.product.unit}</p>
                            <p><strong>Rating:</strong> {msg.product.rating}</p>
                            <p><strong>Discount:</strong> {msg.product.discount}%</p>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bottom-0 w-full bg-slate-800 p-3 border-t border-gray-300 rounded-b-lg">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter your question here"
                className="m2-9 w-72 p-2 border rounded bg-white text-black"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <div>
                <a href="your-link-here" target="_blank" rel="noopener noreferrer">
                  <button className="ml-2 w-9 h-9 p-2 bg-slate-500 text-white hover:bg-slate-600 rounded-full flex items-center justify-center">
                    <img src={what} alt="Icon" className="w-5 h-5 " />
                  </button>
                </a>
                
              </div>
              <button className="ml-2 p-2 bg-slate-500 text-white rounded hover:bg-slate-600" onClick={sendMessage} disabled={loading}>
                <FaPaperPlane className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;
