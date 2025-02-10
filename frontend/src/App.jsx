import React, { useState } from 'react';
import { FaPaperPlane, FaCommentDots, FaChevronDown } from 'react-icons/fa';
import axios from 'axios';

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [expandedProduct, setExpandedProduct] = useState(null);
  const [productLoading, setProductLoading] = useState(false);
  const [chatHeight, setChatHeight] = useState('h-[600px]'); // Added height state

  const sendMessage = async () => {
    if (input.trim() !== '') {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
      setLoading(true);

      try {
        const response = await axios.post('https://bream-dear-physically.ngrok-free.app/query', {
          query: input,
        });

        const data = response.data;

        // Display the response message
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.response, sender: 'bot' },
        ]);

        // Display loading dots while waiting for product results
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: '...', sender: 'bot', isLoading: true },
        ]);

        // Simulate waiting for backend response (remove the dots and display results)
        setTimeout(() => {
          setLoading(false);
          setMessages((prevMessages) =>
            prevMessages.filter((msg) => !msg.isLoading)
          );

          // Show the product results
          data.results.forEach((product) => {
            setMessages((prevMessages) => [
              ...prevMessages,
              { text: product.name, sender: 'bot', product },
            ]);
          });
        }, 2000); // Adjust the timeout according to the backend response time
      } catch (error) {
        console.error('Error fetching query result:', error);
      }
    }
  };

  const toggleProductDetails = (productName) => {
    setExpandedProduct(
      expandedProduct === productName ? null : productName
    );

    if (expandedProduct !== productName) {
      setProductLoading(true);

      // Simulate loading time for product details
      setTimeout(() => {
        setProductLoading(false);
      }, 1500); // Simulate loading time (adjust as needed)
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    // Increase height when chat is open, reduce when closed
    if (!isChatOpen) {
      setChatHeight('h-[800px]'); // Increased height when chat is open
    } else {
      setChatHeight('h-[600px]'); // Default height
    }
  };

  return (
    <>
      <div
        className="fixed bottom-5 right-5 cursor-pointer"
        onClick={toggleChat}
      >
        <div className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-black transition-all">
          <FaCommentDots className="w-4 h-4" />
        </div>
      </div>

      {isChatOpen && (
        <div
          className={`fixed right-5 bottom-19 w-96 h-[670px] bg-black border border-gray-300 shadow-lg rounded-lg flex flex-col`}
        >
          <div className="bg-lime-500 text-white text-center py-3 rounded-t-lg font-bold">
            Senapathy AI
          </div>

          <div className="flex-1 overflow-y-auto p-3 text-gray-200 space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`p-2 rounded max-w-full break-words whitespace-normal ${
                    msg.sender === 'user'
                      ? 'bg-lime-500 text-white'
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  {msg.text}
                </div>
                {msg.product && (
                  <div className="w-full mt-2">
                    <div className="flex justify-between items-center">
                      <button
                        className="text-blue-500 flex items-center"
                        onClick={() => toggleProductDetails(msg.product.name)}
                      >
                        <FaChevronDown
                          className={`w-4 h-4 ${expandedProduct === msg.product.name ? 'rotate-180' : ''}`}
                        />
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

          <div className="absolute bottom-0 w-full bg-black p-3 border-t border-gray-300">
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Enter your question here"
                className="w-full p-2 border rounded bg-gray-800 text-white"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <button
                className="ml-2 p-2 bg-lime-500 text-white rounded hover:bg-lime-600"
                onClick={sendMessage}
                disabled={loading}
              >
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
