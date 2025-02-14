import { BrowserRouter as Router,Routes,Route } from 'react-router-dom'

import Register from './Register'
import Login from './Login'
import Dashboard from './Dashboard';

const Farm=()=>{
    return(
        <Router>
            <Routes>
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
            </Routes>
        </Router>
    );
};

export default Farm;