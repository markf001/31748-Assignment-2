import mongoose from 'mongoose';

export interface Book extends Document {
    user: mongoose.Types.ObjectId; 
    title: string;
    author: string;
    chapters: number;
    chaptersRead: number;
    status: string;
    rating: number;
    comments: string;
}

const bookSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    title: { 
        type: String, 
        required: true 
    },
    author: { 
        type: String, 
        required: true 
    },
    chapters: { 
        type: Number, 
        required: true 
    },
    chaptersRead: { 
        type: Number, 
        default: 0
    },
    status: { 
        type: String, 
        enum: ['Plan to Read', 'Reading', 'Completed', 'Paused', 'Dropped'],
        default: 'Plan to Read' 
    },
    rating: { 
        type: Number, 
        min: 0, 
        max: 5  
    },
    comments: {
        type: String,
        required: false
    }
});

export const Book = mongoose.model('Book', bookSchema);