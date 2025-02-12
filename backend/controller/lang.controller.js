const axios = require('axios');

const chat = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query) {
            return res.status(400).json({ error: "Query is required" });
        }

        const authToken = req.headers.authorization; // Get token from headers

        if (!authToken) {
            return res.status(401).json({ error: "Unauthorized: Missing token" });
        }

        const response = await axios.post(
            'http://127.0.0.1:8000/chat', 
            { query }, 
            { headers: { Authorization: authToken } } // Send token in headers
        );

        res.json(response.data);  
    } catch (err) {
        console.error("Error communicating with FastAPI:", err.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = {
    chat
};
