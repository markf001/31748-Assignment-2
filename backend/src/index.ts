import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { Book } from './models/Book';
import authRoutes from './routes/auth';
import { verifyToken, AuthRequest } from './middleware/authMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
  console.error('MONGO_URI is missing in .env file');
  process.exit(1); 
}

mongoose.connect(mongoURI)
  .then(() => console.log('Successfully connected'))
  .catch((err) => console.error('Connection error:', err));

app.get('/api/books', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const query = req.user?.role === 'admin' ? {} : { user: req.user?.userId };
    const books = await Book.find(query); 
    res.json(books);                
  }
  catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
});

app.post('/api/books', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const newBook = new Book({
      ...req.body,
      user: req.user?.userId 
    }); 
    const savedBook = await newBook.save(); 
    res.status(201).json(savedBook); 
  }
  catch (error) {
    res.status(400).json({ message: "Failed to save book", error });
  }
});

app.delete('/api/books/:id', verifyToken, async (req: AuthRequest, res: Response) => {
  try {
    const bookId = req.params.id; 
    const book = await Book.findById(bookId);

    if (!book) {
      res.status(404).json({ message: "Book not found!" });
      return;
    }

    if (book.user.toString() !== req.user?.userId && req.user?.role !== 'admin') {
      res.status(403).json({ message: "Not authorised to delete this book" });
      return;
    }

    await Book.findByIdAndDelete(bookId);
    res.json({ message: "Successfully deleted!" });
  }
  catch (error) {
    res.status(500).json({ message: "Server error while deleting" });
  }
});

app.put('/api/books/:id', verifyToken, async (req: AuthRequest, res: Response) => {
    try {
        const bookId = req.params.id;
        const book = await Book.findById(bookId);

        if (!book) {
            res.status(404).json({ message: "Book not found!" });
            return;
        }

        if (book.user.toString() !== req.user?.userId && req.user?.role !== 'admin') {
          res.status(403).json({ message: "Not authorised to edit this book" });
          return;
        }

        const updatedBook = await Book.findByIdAndUpdate(bookId, req.body, { new: true });
        res.json(updatedBook);
    }
    catch (error) {
        res.status(500).json({ message: "Server error while updating" });
    }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});