# Professional Authentication Strategy: Full Stack JWT Implementation

This project provides a robust and professionally structured implementation of a full-stack authentication system. It features a stateless backend API using **Node.js, Express, and PostgreSQL**, with security handled by **JSON Web Tokens (JWT)**. The project also includes a vanilla **HTML, CSS, and JavaScript** frontend client to interact with the API.

This is a complete, production-ready blueprint for handling user registration, secure login, and protecting API routes.

## Project Features Checklist

This implementation successfully completes and expands upon all requirements of the initial project brief.

- [x] **Stateless JWT Authentication:** Chose and implemented a stateless JWT strategy, ideal for scalable applications.
- [x] **Defined Token Format:** JWTs contain `sub` (user ID), `roles`, and `exp` (expiration) claims.
- [x] **Secure Password Hashing:** User passwords are never stored in plaintext. They are securely hashed using `bcryptjs` before being saved to the database.
- [x] **Database Integration:** Moved from a dummy user list to a persistent **PostgreSQL** database for real-world user management.
- [x] **Complete API Endpoints:**
    - `POST /api/auth/register`: For new user creation.
    - `POST /api/auth/login`: To authenticate users and issue JWTs.
    - `GET /api/users/profile`: An example protected route that requires a valid JWT.
- [x] **Protective Middleware:** A robust middleware validates tokens on all protected routes.
- [x] **Full Frontend Client:** A user-friendly web interface (`index.html`) is provided to register, log in, and fetch protected data.
- [x] **CORS Handling:** The backend is configured to securely accept requests from the frontend.
- [x] **Comprehensive Testing:** The backend includes a full suite of integration and unit tests using Jest.
- [x] **CLI for Token Generation:** A utility script is included for quickly generating tokens during development.

## Project Structure

The project is organized with a clear separation of concerns, separating the frontend, backend API, and business logic.

```
/project-root
├── /src
│   ├── /api
│   │   ├── /auth           # Authentication routes, controller, service
│   │   ├── /middleware     # Authentication middleware
│   │   └── /users          # Example protected routes
│   ├── /config             # Environment variable management
│   ├── /scripts            # CLI tools (e.g., token generator)
│   ├── /services
│   │   ├── db.service.js   # Centralized database connection logic
│   │   └── jwt.service.js  # Centralized JWT logic
│   ├── app.js              # Express app configuration
│   └── server.js           # Server startup
├── /tests
│   ├── /integration
│   └── /unit
├── .env                    # Local environment variables (not committed)
├── index.html              # The frontend UI
├── script.js               # Frontend JavaScript logic
├── style.css               # Frontend styling
└── package.json
```

## Setup and Installation

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/download/) (a running instance, either locally or on a cloud service)

### 2. Clone and Install Dependencies
Navigate to your project directory and run:
```bash
npm install
```

### 3. Setup the Database
[here is tutorial to create Database](https://dbeaver.com/2022/03/03/how-to-create-database-connection-in-dbeaver/)

then:
You need to create the `users` table in your PostgreSQL database.

**a. Connect to your database** using a tool like DBeaver, pgAdmin, or the `psql` command-line interface.

**b. Run the following SQL script** to create the table:
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    roles TEXT[] NOT NULL DEFAULT '{user}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 4. Configure Environment Variables
Create a `.env` file in the root of the project. Copy the contents of `.env.example` (if it exists) or use the template below.

```env
# Server configuration
PORT=3000

# JWT configuration
# IMPORTANT: Use a long, complex, and random string for JWT_SECRET in production
JWT_SECRET=your_super_secret_key_that_is_at_least_32_characters_long
JWT_EXPIRES_IN=1h

# PostgreSQL Database connection URL
# Replace user, password, host, port, and database_name with your actual credentials.
DATABASE_URL="postgresql://user:password@host:port/database_name"
```
**Important:** The application will fail to start if the `DATABASE_URL` is incorrect or if it cannot connect to the database.

## Running the Application

You need to run the backend server and serve the frontend files.

### 1. Start the Backend Server
Run the following command in your terminal. This will start the API server on `http://localhost:3000`.
```bash
npm start
```

### 2. Launch the Frontend
The easiest way to run the frontend is with a simple live server.
- If you use **Visual Studio Code**, install the **"Live Server"** extension.
- Right-click on the `index.html` file and select **"Open with Live Server"**.
- This will open the user interface in your browser.

## How to Use the Application

Once the backend is running and you have opened `index.html`:

1.  **Register:** Use the "Register New User" form to create an account.
2.  **Login:** Use the "Login User" form with the same credentials. Upon success, a JWT will be stored in the browser's memory for this session.
3.  **Get Protected Data:** Click the "Get My Profile" button. The frontend will send the stored JWT to the server to fetch your user data from the protected endpoint.

The "API Response" box will show the raw data returned from the server for each action.

## Running Tests

To run the backend test suite (both unit and integration tests), use:
```bash
npm test
```
**Note:** The tests do not interact with the PostgreSQL database. They test the logic in isolation.