import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { type Book } from '../App'; 

interface User {
    _id: string;
    username: string;
    role: string;
    createdAt: string;
}

export const AdminPage: React.FC = () => {
    const authContext = useContext(AuthContext);
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);
    const [userBooks, setUserBooks] = useState<Book[]>([]);
    const [isLoadingBooks, setIsLoadingBooks] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
        const response = await fetch('http://localhost:5000/api/users', {
            headers: { 'Authorization': `Bearer ${authContext?.token}` }
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setUsers(data);
        }
        catch (err: any) {
        setError(err.message);
        }
    };

    const handleDeleteUser = async (userId: string, username: string) => {
        if (!window.confirm(`Are you sure you want to delete ${username}'s account?`)) return;

        try {
        const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authContext?.token}` }
        });
        
        if (response.ok) {
            setUsers(users.filter(user => user._id !== userId));
        }
        else {
            const data = await response.json();
            alert(data.message || "Failed to delete user");
        }
        } 
        catch (err) {
        console.error("Error deleting user:", err);
        }
    };

    const handleViewBooks = async (user: User) => {
        setViewingUser(user);
        setIsLoadingBooks(true);
        setUserBooks([]); 

        try {
        const response = await fetch(`http://localhost:5000/api/users/${user._id}/books`, {
            headers: { 'Authorization': `Bearer ${authContext?.token}` }
        });
        if (!response.ok) throw new Error("Failed to get this user's books");
        const data = await response.json();
        setUserBooks(data);
        }
        catch (err: any) {
        alert(err.message);
        }
        finally {
        setIsLoadingBooks(false);
        }
    };

    if (viewingUser) {
        return (
        <div style={{ marginTop: '20px' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
            <h2>{viewingUser.username}'s Library</h2>
            
            <button className="btn btn-nav" onClick={() => setViewingUser(null)}>
                &larr; Back to Users
            </button>
            </div>

            {isLoadingBooks ? (
            <p>Loading books...</p>
            ) : userBooks.length === 0 ? (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>This user has no books in their library.</p>
            ) : (
            <div className="book-grid" style={{ marginTop: '20px' }}>
                {userBooks.map((book, index) => (
                <div key={book._id || index} className="book-card">
                    <h3>{book.title}</h3>
                    <p className="book-author">by {book.author}</p>
                    <div className="book-details">
                    <span><strong>Status:</strong> {book.status}</span>
                    <span><strong>Progress:</strong> {book.chaptersRead} / {book.chapters}</span>
                    <span><strong>Rating:</strong> {book.rating || 'N/A'} / 5</span>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
        );
    }

    return (
        <div style={{ marginTop: '20px' }}>
        <h2>Admin Dashboard: User Management</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
            <tr style={{ borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th>Username</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
            </tr>
            </thead>
            <tbody>
            {users.map((user) => (
                <tr key={user._id} style={{ borderBottom: '1px solid #ddd', height: '50px' }}>
                <td>{user.username}</td>
                <td>
                    <span style={{ 
                    backgroundColor: user.role === 'admin' ? '#ffebee' : '#e8f5e9',
                    color: user.role === 'admin' ? '#c62828' : '#2e7d32',
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85em'
                    }}>
                    {user.role}
                    </span>
                </td>
                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                <td style={{ display: 'flex', gap: '10px', alignItems: 'center', height: '50px' }}>
                    {user.role !== 'admin' && (
                    <>
                        <button 
                        className="btn btn-primary" 
                        onClick={() => handleViewBooks(user)}
                        style={{ padding: '4px 8px', fontSize: '0.85em' }}
                        >
                        View Library
                        </button>
                        <button 
                        className="btn btn-delete" 
                        onClick={() => handleDeleteUser(user._id, user.username)}
                        style={{ padding: '4px 8px', fontSize: '0.85em' }}
                        >
                        Delete User
                        </button>
                    </>
                    )}
                </td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    );
};