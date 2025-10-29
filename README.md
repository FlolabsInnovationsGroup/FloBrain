# JWT Authentication & Authorization API

A robust backend service built with Node.js, Express, and PostgreSQL that provides a complete and secure authentication and authorization solution using JSON Web Tokens (JWT). This project includes user registration, login, password hashing, role-based access control, and a full suite of integration and unit tests.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Running Tests](#running-tests)
- [API Contract](#api-contract)
  - [Authentication Routes](#authentication-routes)
  - [Protected Routes](#protected-routes)
- [Manual Testing with cURL](#manual-testing-with-curl)
- [License](#license)

## Features

-   **User Registration:** Securely register new users with password hashing via **bcrypt**.
-   **User Login:** Authenticate users and issue stateless **JSON Web Tokens (JWT)**.
-   **Protected Routes:** Middleware to protect routes, requiring a valid JWT.
-   **Role-Based Access Control (RBAC):** Middleware to restrict access based on user roles (`user`, `admin`).
-   **PostgreSQL Integration:** Uses **Sequelize** as an ORM for stable and secure database interactions.
-   **Database Migrations:** Manage database schema changes professionally with Sequelize Migrations.
-   **Database Seeding:** Populate the database with test data for a consistent development and testing environment.
-   **Comprehensive Testing:** Unit and integration tests written with **Jest** and **Supertest**.

## Project Structure

```
.
├── config/              # Sequelize CLI configuration
├── migrations/          # Database migration files
├── models/              # Sequelize auto-generated index file
├── seeders/             # Database seeder files
├── src/                 # Main application source code
│   ├── api/             # Routes, middlewares
│   ├── controllers/     # Request handlers (business logic)
│   ├── models/          # Sequelize model definitions
│   ├── services/        # Reusable services (e.g., JWT generation)
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── tests/               # Test files (unit and integration)
├── .env                 # Environment variables (private)
├── jest.config.js       # Jest configuration
└── package.json         # Project dependencies and scripts
```

## Prerequisites

Before you begin, ensure you have the following installed on your local machine:
-   [Node.js](https://nodejs.org/) (v18.x or later recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   [PostgreSQL](https://www.postgresql.org/)
-   A database management tool like [DBeaver](https://dbeaver.io/) or [pgAdmin](https://www.pgadmin.org/) (recommended)

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Create the environment file:**
    Create a file named `.env` in the root of the project and add the following variables.

    ```env
    # .env.example
    
    # Server Configuration
    PORT=3000
    
    # Database Connection URL
    # Format: postgresql://<user>:<password>@<host>:<port>/<database_name>
    DATABASE_URL="postgresql://postgres:1234@localhost:5432/postgres"
    
    # JWT Configuration
    JWT_SECRET="your_super_secret_and_long_random_string_here"
    JWT_EXPIRES_IN="1h"
    ```
    **Important:** Replace `DATABASE_URL` with your actual database connection string and `JWT_SECRET` with a long, unique, and random string.

## Database Setup

1.  **Ensure your PostgreSQL server is running.**

2.  **Run the database migrations:**
    This command will create the `Users` table and the `SequelizeMeta` table in your database.
    ```bash
    npm run db:migrate
    ```

3.  **Run the database seeders:**
    This will populate the `Users` table with initial data for testing (one `user` and one `admin`).
    ```bash
    npm run db:seed:all
    ```

## Running the Application

-   **Development Mode:**
    Starts the server with `nodemon`, which will automatically restart on file changes.
    ```bash
    npm run dev
    ```
    The server will be available at `http://localhost:3000`.

-   **Production Mode:**
    Starts the server in a standard Node.js process.
    ```bash
    npm start
    ```

## Running Tests

This project uses Jest for testing. The test suite covers both unit tests for isolated services and integration tests for the full API flow.
```bash
npm test
```

## API Contract

All requests and responses use the JSON format. The standard success/error envelope is used.

### Authentication Routes

#### `POST /api/v1/auth/register`
Registers a new user.
-   **Access:** `Public`
-   **Request Body:**
    ```json
    {
      "email": "testuser@example.com",
      "password": "strongpassword123",
      "full_name": "Test User"
    }
    ```
-   **Success Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "token": "<jwt_token>",
        "user": {
          "id": "...",
          "email": "testuser@example.com",
          "role": "user"
        }
      }
    }
    ```
-   **Error Responses:** `400 Bad Request` (missing fields), `409 Conflict` (email already exists).

---

#### `POST /api/v1/auth/login`
Authenticates a user and returns a new JWT.
-   **Access:** `Public`
-   **Request Body:**
    ```json
    {
      "email": "testuser@example.com",
      "password": "strongpassword123"
    }
    ```
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "token": "<jwt_token>",
        "user": {
          "id": "...",
          "email": "testuser@example.com",
          "role": "user"
        }
      }
    }
    ```
-   **Error Responses:** `401 Unauthorized` (invalid credentials).

### Protected Routes

All protected routes require an `Authorization` header in the following format:
`Authorization: Bearer <jwt_token>`

---

#### `GET /api/v1/ping-protected`
A sample route to check if a user is authenticated.
-   **Access:** `Authenticated (user or admin)`
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Pong!",
      "data": {
        "user_id": "..."
      }
    }
    ```
-   **Error Responses:** `401 Unauthorized` (token missing or invalid).

---

#### `GET /api/v1/admin/ping`
A sample route to check if a user has the `admin` role.
-   **Access:** `Admin Only`
-   **Success Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Pong from Admin Route!",
      "data": {
        "user_id": "...",
        "message": "Access granted to admin."
      }
    }
    ```
-   **Error Responses:** `401 Unauthorized` (token missing or invalid), `403 Forbidden` (user is not an admin).

## Manual Testing with cURL

After setting up the database and running the seeders, you can test the full authentication flow using `curl`.

**1. Register a New User**
First, test the registration endpoint to create a brand new user.

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
-H "Content-Type: application/json" \
-d '{
  "email": "newuser123@example.com",
  "password": "password123",
  "full_name": "New Test User"
}'
```
> **Expected Result:** A `201 Created` response with a token for the new user. You can verify in your database that this user was added to the `Users` table.

---

**2. Login as a Standard User**
The seeders create a user with the email `test@example.com` and password `password123`.

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "test@example.com",
  "password": "password123"
}'
```
> **Action:** Copy the `token` from the response.

---

**3. Test Protected Routes (as User)**
Replace `<USER_TOKEN>` with the token you copied from the login step.

-   **Access a general protected route (Expect 200 OK):**
    ```bash
    curl http://localhost:3000/api/v1/ping-protected -H "Authorization: Bearer <USER_TOKEN>"
    ```

-   **Attempt to access an admin route (Expect 403 Forbidden):**
    ```bash
    curl http://localhost:3000/api/v1/admin/ping -H "Authorization: Bearer <USER_TOKEN>"
    ```

---

**4. Login as an Admin User**
The seeders create an admin with the email `admin@example.com` and password `adminpassword`.

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
-H "Content-Type: application/json" \
-d '{
  "email": "admin@example.com",
  "password": "adminpassword"
}'
```
> **Action:** Copy the new `token` from the response.

---

**5. Test Admin Route (as Admin)**
Replace `<ADMIN_TOKEN>` with the new token.

-   **Access an admin route (Expect 200 OK):**
    ```bash
    curl http://localhost:3000/api/v1/admin/ping -H "Authorization: Bearer <ADMIN_TOKEN>"
    ```
## License

This project is licensed under the MIT License.