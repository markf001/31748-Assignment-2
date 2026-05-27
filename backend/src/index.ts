import express, { Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import { Book } from './models/Book';
import authRoutes from './routes/auth';
import { verifyToken, requireAdmin } from './middleware/authMiddleware';

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

app.get('/api/books', async (req: Request, res: Response) => {
  try {
    const books = await Book.find(); 
    res.json(books);                
  }
  catch (error) {
    res.status(500).json({ message: "Error fetching books" });
  }
}
);

app.post('/api/books', verifyToken, async (req: Request, res: Response) => {
  try {
    const newBook = new Book(req.body); 
    const savedBook = await newBook.save(); 
    
    res.status(201).json(savedBook); 
  }
  catch (error) {
    res.status(400).json({ message: "Failed to save book", error });
  }
}
);

app.delete('/api/books/:id', verifyToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const bookId = req.params.id; 
    const deletedBook = await Book.findByIdAndDelete(bookId);

    if (!deletedBook) {
      res.status(404).json({ message: "Book not found!" });
      return;
    }

    res.json({ message: "Successfully deleted!" });
  }
  catch (error) {
    res.status(500).json({ message: "Server error while deleting" });
  }
}
);

app.put('/api/books/:id', verifyToken, requireAdmin, async (req: Request, res: Response) => {
    try {
        const bookId = req.params.id;
        const updatedData = req.body;
        const updatedBook = await Book.findByIdAndUpdate(bookId, updatedData, { new: true });

        if (!updatedBook) {
            res.status(404).json({ message: "Book not found!" });
            return;
        }

        res.json(updatedBook);
    }
    catch (error) {
        res.status(500).json({ message: "Server error while updating" });
    }
});

app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});