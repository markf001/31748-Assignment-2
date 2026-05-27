Book Tracker Application

## Project Description
This is a single-page application designed to solve the problem of managing and keeping track of personal reading lists across multiple series. 
It has a minimalistic home page to track reading status, chapter progress, personal rating, and comments left for a book entered into the app. 
There is also an admin function to manage and view a user's lists. 

## Technical Stack & Dependencies

### The Stack
* **Frontend:** React, Vite, TypeScript
* **Backend:** Node.js, Express.js, TypeScript
* **Database:** MongoDB (via Mongoose)
* **Authentication:** JWT & Password Hashing

### Core Dependencies
* **Backend:** `express`, `mongoose`, `cors`, `dotenv`, `jsonwebtoken`, `bcrypt`
* **Frontend:** `react`, `react-dom`

## How to Run the App
1. Create a .env file in the backend directory
2. I used mongodb cloud for this assignment, so create and activate a cluster
3. Add your MongoDB connection string from the cluster and a make up hidden key for JWT:
   * MONGO_URI=
   * JWT_SECRET=book_tracker_hidden_key_{your key here}
4. cd to backend folder in a terminal, install dependencies and run the server:
   * cd backend
   * npm install
   * npx tsx src/index.ts
5. cd to frontend folder in another terminal, install dependencies and run vite:
   * cd frontend
   * npm install
   * npm run dev
6. Now you should be able to access the application!
   
### Folder Structure

```text
book-tracker/
│
├── backend/                   
│   ├── src/
│   │   ├── middleware/        (authMiddleware.ts)
│   │   ├── models/            (Book.ts, User.ts)
│   │   ├── routes/            (auth.ts)
│   │   └── index.ts           
│   │
│   ├── .env                   
│   ├── package.json           
│   └── tsconfig.json          
│
└── frontend/                  
    ├── src/
    │   ├── components/        (LoginPage.tsx, RegisterPage.tsx, AdminPage.tsx)
    │   ├── context/           (AuthContext.tsx)
    │   ├── App.tsx
    │   ├── App.css          
    │   ├── main.tsx           
    │   └── index.css          
    │
    ├── package.json           
    ├── tsconfig.json          
    └── vite.config.ts        

