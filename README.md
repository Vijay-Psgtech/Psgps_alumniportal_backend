# PSG Public School Alumni Portal - Backend

This repository contains the backend code for the PSG Public School Alumni Portal. The backend is built using Node.js and Express.js, and it provides RESTful APIs for managing alumni data, user authentication, and other functionalities required for the alumni portal.

Project Structure:

````server
├── config/                 # Configuration files (e.g., database, environment variables)
├── controllers/            # Controller files for handling API requests
├── models/                 # Mongoose models for MongoDB collections
├── routes/                 # Express route definitions
├── middlewares/            # Custom middleware functions (e.g., authentication, error handling)
├── utils/                  # Utility functions and helpers
├── server.js                  # Main application file
├── package.json            # Project metadata and dependencies
├── README.md               # Project documentation

Getting Started:

To get started with the PSG Public School Alumni Portal backend, follow these steps:

1. Clone the repository:
   ```bash
   git clone

2. Navigate to the project directory:
   ```bash
   cd psg-public-school-alumni-portal-backend
````

3. Install dependencies:

   ```bash

    npm install
   ```

4. Set up environment variables:

   Create a `.env` file in the root directory and add the following variables:

   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   ```

5. Start the server:
   ```bash
   npm start
   ```
