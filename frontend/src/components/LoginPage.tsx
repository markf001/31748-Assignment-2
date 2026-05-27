import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
  
    const authContext = useContext(AuthContext);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }

        if (authContext) {
            authContext.login(data.token, data.role); 
        }
        }
        catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="auth-container" style={{
            maxWidth: '400px',
            width: '100%',
            padding: '20px'
        }}>
            <h2 style={{
                marginBottom: '20px'
            }}>Login</h2>
            
            {error && <p style={{
                color: '#ff6b6b',
                marginBottom: '15px'
            }}>{error}</p>}
      
        <form onSubmit={handleSubmit}>
            <div style={{
                marginBottom: '20px'
            }}>
                <label style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '0.9rem',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    color: '#aaa'
                }}>Username:</label>
            <input 
                type="text" 
                value={username} 
                onChange={(e) => setUsername(e.target.value)} 
                required 
                style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    backgroundColor: '#2a2a35',
                    color: 'white'
            }}
            />
        </div>
        
        <div style={{ marginBottom: '30px' }}>
            <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                color: '#aaa'
            }}>Password:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{
                width: '100%',
                padding: '10px',
                borderRadius: '4px',
                border: '1px solid #444',
                backgroundColor: '#2a2a35',
                color: 'white'
            }}
          />
        </div>

                <button type="submit" className="btn btn-primary" style={{
                    width: '100%',
                    padding: '12px',
                    fontSize: '1.1rem',
                    marginBottom: '20px'
                }}>
          Log In
        </button>
      </form>
      
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginTop: '10px'
        }}>
            <p style={{
                margin: 0,
                color: '#ccc'
            }}>Don't have an account?</p>
        <button className="btn btn-nav" onClick={onSwitchToRegister}>Register here</button>
      </div>
    </div>
  );
};