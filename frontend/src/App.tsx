import { useState, useEffect, useContext } from 'react';
import './App.css';
import { AuthContext } from './context/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';

export interface Book {
  _id?: string;
  title: string;
  author: string;
  chapters: number | '';
  chaptersRead: number | '';
  status: 'Plan to Read' | 'Reading' | 'Completed' | 'Paused' | 'Dropped';
  rating?: number | '';
  comments: string;
}

const emptyForm: Book = {
  title: '',
  author: '',
  chapters: '',
  chaptersRead: '',
  status: 'Plan to Read',
  rating: '',
  comments: ''
};

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'add-book'>('home');
  const [books, setBooks] = useState<Book[]>([]); 
  const [formData, setFormData] = useState<Book>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z' | 'z-a'>('newest');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authContext = useContext(AuthContext);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    if (!authContext?.isAuthenticated) return;

    fetch('http://localhost:5000/api/books', {
      headers: {
        'Authorization': `Bearer ${authContext.token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Database connection failed");
        return res.json();
      })
      .then((data) => {
        setBooks(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Could not get books:", err);
        setError("Failed to load books. Is the server running?");
        setIsLoading(false);
      });
  }, [authContext?.isAuthenticated, authContext?.token]);

  const handleEditClick = (book: Book) => {
    if (!book._id) return;
    setEditingId(book._id);
    setFormData(book);     
    setCurrentView('add-book'); 
  };

  const handleCancel = () => {
    setFormData(emptyForm); 
    setEditingId(null);     
    setCurrentView('home');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.chapters !== '' && formData.chaptersRead !== '') {
      if (formData.chapters > 0 && formData.chaptersRead > formData.chapters) {
        alert("'Chapters Read' cannot be greater than 'Total Chapters'");
        return; 
      }
    }
    try {
      if (editingId) {
        const response = await fetch(`http://localhost:5000/api/books/${editingId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authContext?.token}`
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          const updatedBook = await response.json();
          setBooks(books.map((b) => (b._id === editingId ? updatedBook : b)));
        }
      }
      else {
        const response = await fetch('http://localhost:5000/api/books', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authContext?.token}`
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          const savedBook = await response.json();
          setBooks([...books, savedBook]);
        }
      }
      setFormData(emptyForm);
      setEditingId(null);
      setCurrentView('home');
    }
    catch (error) {
      console.error("Network error:", error);
    }
  };

  const handleDelete = async (idToDelete: string) => {
    if (!window.confirm("Are you sure you want to delete this book?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/books/${idToDelete}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${authContext?.token}` 
        }
      });
      if (response.ok) {
        setBooks(books.filter((book) => book._id !== idToDelete));
      }
    }
    catch (error) {
      console.error("Network error:", error);
    }
  };

const sortedBooks = [...books].sort((a, b) => {
    if (sortBy === 'a-z') return a.title.localeCompare(b.title);
    if (sortBy === 'z-a') return b.title.localeCompare(a.title);
    
    if (sortBy === 'newest') return (b._id || '').localeCompare(a._id || '');
    if (sortBy === 'oldest') return (a._id || '').localeCompare(b._id || '');
    
    return 0;
});
  
if (!authContext?.isAuthenticated) {
  return (
    <div className="app-container">
      {authView === 'login' ? (
        <Login onSwitchToRegister={() => setAuthView('register')} />
      ) : (
        <Register onSwitchToLogin={() => setAuthView('login')} />
      )}
    </div>
  );
}

  return (
    <div className="app-container">
      
      <header className="app-header">
        <h1>Book Tracker</h1>
        <nav>
          <button className="btn btn-nav" onClick={handleCancel}>Home</button>
          <button className="btn btn-primary" onClick={() => setCurrentView('add-book')}>Add Book</button>
        </nav>
      </header>

      {currentView === 'home' && (
        <main>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>Your Library</h2>
            
            {!isLoading && !error && books.length > 0 && (
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ width: 'auto', padding: '8px 30px 8px 15px', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <option value="newest">Newest Added</option>
                <option value="oldest">Oldest Added</option>
                <option value="a-z">A - Z</option>
                <option value="z-a">Z - A</option>
              </select>
            )}
          </div>

          {isLoading && (
            <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-secondary)' }}>
              Loading your library...
            </p>
          )}

          {error && (
            <div style={{ 
              backgroundColor: '#ffebee', 
              color: '#c62828', 
              padding: '15px', 
              borderRadius: '8px', 
              marginTop: '20px',
              border: '1px solid #ef9a9a' 
            }}>
              <strong>Status:</strong> {error}
            </div>
          )}

          {!isLoading && !error && books.length === 0 && (
            <p style={{ textAlign: 'center', marginTop: '20px' }}>
              Your library is empty! Add a book to get started.
            </p>
          )}

          {!isLoading && !error && books.length > 0 && (
            <div className="book-grid">
              {sortedBooks.map((book, index) => (
                <div key={book._id || index} className="book-card">
                  <h3>{book.title}</h3>
                  <p className="book-author">by {book.author}</p>
                  
                  <div className="book-details">
                    <span><strong>Status:</strong> {book.status}</span>
                    <span><strong>Progress:</strong> {book.chaptersRead} / {book.chapters}</span>
                    <span><strong>Rating:</strong> {book.rating} / 5</span>
                  </div>

                  <div className="book-comments">
                    {book.comments ? `"${book.comments}"` : <span style={{ opacity: 0.5 }}>No comments yet...</span>}
                  </div>

                  <div className="card-actions">
                    <button className="btn btn-primary" onClick={() => handleEditClick(book)}>Edit</button>
                    <button className="btn btn-delete" onClick={() => book._id && handleDelete(book._id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {currentView === 'add-book' && (
        <main>
          <h2>{editingId ? 'Edit Entry' : 'Add a New Entry'}</h2>
          
          <div className="form-container">
            <form onSubmit={handleSubmit}>
              
              <div className="form-group">
                <label>Title:</label>
                <input type="text" required value={formData.title} onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })} />
              </div>

              <div className="form-group">
                <label>Author:</label>
                <input type="text" required value={formData.author} onChange={(e) =>
                  setFormData({ ...formData, author: e.target.value })} />
              </div>

              <div className="form-row">
                <div>
                  <label>Total Chapters:</label>
                  <input type="number" required min="0" value={formData.chapters} onChange={(e) =>
                    setFormData({ ...formData, chapters: e.target.value === '' ? '' : Number(e.target.value) })} />
                </div>
                
                <div>
                  <label>Chapters Read:</label>
                  <input type="number" required min="0" value={formData.chaptersRead} onChange={(e) =>
                    setFormData({ ...formData, chaptersRead: e.target.value === '' ? '' : Number(e.target.value) })} />
                </div>
              </div>

              <div className="form-row">
                <div>
                  <label>Rating (1-5):</label>
                  <input type="number" min="1" max="5" value={formData.rating} onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value === '' ? '' : Number(e.target.value) })} />
                </div>
                <div>
                  <label>Status:</label>
                  <select value={formData.status} onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as Book['status'] })}>
                    <option value="Plan to Read">Plan to Read</option>
                    <option value="Reading">Reading</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                    <option value="Dropped">Dropped</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Comments:</label>
                <input type="text" value={formData.comments} onChange={(e) =>
                  setFormData({ ...formData, comments: e.target.value })} />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingId ? 'Update' : 'Save'}
                </button>
                <button type="button" className="btn btn-nav" onClick={handleCancel}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      )}
    </div>
  );
}