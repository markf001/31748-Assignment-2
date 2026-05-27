import express, { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

const router = express.Router();

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      res.status(400).json({ error: 'Username already taken' });
      
        return;
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = new User({
      username,
      password_hash: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: 'Registered successfully' });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    
    if (!user) {
      res.status(401).json({ error: 'Invalid login details' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid login details' });
      return;
    }

    const payload = {
      userId: user._id,
      role: user.role,
    };

    const secret = process.env.JWT_SECRET; 
      if (!secret) {
          throw new Error("error, JWT_SECRET not defined in .env");
      }    

    
    const token = jwt.sign(payload, secret, { expiresIn: '24h' });

    res.json({ message: 'Login successful', token, role: user.role });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

export default router;