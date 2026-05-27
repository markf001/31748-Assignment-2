import React, { useState } from 'react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

export const Register: React.FC<RegisterProps> = ({ onSwitchToLogin }) => {
    
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }

        setSuccess('Registration completed!');
        setUsername('');
        setPassword('');
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
      <h2 style={{ marginBottom: '20px' }}>Register</h2>
            {error && <p style={{
                color: '#ff6b6b',
                marginBottom: '15px'
            }}>{error}</p>}
            
            {success && <p style={{
                color: '#4ade80',
                marginBottom: '15px'
            }}>{success}</p>}
      
    <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
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
          Register
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
                }}>Already have an account?</p>
        <button className="btn btn-nav" onClick={onSwitchToLogin}>Log in here</button>
      </div>
    </div>
    );
};