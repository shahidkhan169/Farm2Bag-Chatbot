
// import React, { useState } from 'react';
// import { FaPaperPlane } from 'react-icons/fa'; 

// function Chatbot() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');

//   const sendMessage = () => {
//     if (input.trim() !== '') {
//       setMessages([...messages, { text: input, sender: 'user' }]);
//       setInput('');
//     }
//   };

//   return (
//     <div className="fixed right-0 w-96 h-screen bg-black border border-gray-300 shadow-lg rounded-lg flex flex-col">
//       <div className="bg-lime-500 text-white text-center py-3 rounded-t-lg font-bold">
//         Chat AI
//       </div>

//       <div className="flex-1 overflow-y-auto p-3 text-gray-200 space-y-2">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`flex ${
//               msg.sender === 'user' ? 'justify-end' : 'justify-start'
//             }`}
//           >
//             <div
//               className={`p-2 rounded max-w-xs break-words whitespace-normal ${
//                 msg.sender === 'user' ? 'bg-lime-500 text-white' : 'bg-gray-700 text-white'
//               }`}
//             >
//               {msg.text}
//             </div>
//           </div>
//         ))}
//       </div>

//       <div className="absolute bottom-0 w-full bg-black p-3 border-t border-gray-300">
//         <div className="flex items-center">
//           <input
//             type="text"
//             placeholder="Enter your question here"
//             className="w-full p-2 border rounded bg-gray-800 text-white"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
//           />
//           <button
//             className="ml-2 p-2 bg-lime-500 text-white rounded hover:bg-blue-600"
//             onClick={sendMessage}
//           >
//             <FaPaperPlane className="w-5 h-5" /> 
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Chatbot;


import React, { useState } from 'react';
import { FaPaperPlane, FaCommentDots } from 'react-icons/fa'; 

function Chatbot() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false); 

  const sendMessage = () => {
    if (input.trim() !== '') {
      setMessages([...messages, { text: input, sender: 'user' }]);
      setInput('');
    }
  };

  return (
    <>
      <div
        className="fixed bottom-5 right-5 cursor-pointer"
        onClick={() => setIsChatOpen(!isChatOpen)}
      >
        <div className="bg-black text-white p-4 rounded-full shadow-lg hover:bg-black transition-all">
          <FaCommentDots className="w-4 h-4" /> 
        </div>
      </div>

    
      {isChatOpen && (
        <div className="fixed right-5 bottom-19 w-96 h-[600px] bg-black border border-gray-300 shadow-lg rounded-lg flex flex-col">
          <div className="bg-lime-500 text-white text-center py-3 rounded-t-lg font-bold">
            Chat AI
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
                  className={`p-2 rounded max-w-xs break-words whitespace-normal ${
                    msg.sender === 'user' ? 'bg-lime-500 text-white' : 'bg-gray-700 text-white'
                  }`}
                >
                  {msg.text}
                </div>
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