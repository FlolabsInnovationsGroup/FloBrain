# Express File Upload API

This project is a robust prototype of an Express.js server designed to handle audio and video file uploads. It features a professional and scalable project structure, validation for file types and size limits, and seamless integration with a PostgreSQL database to store file metadata. Files can be saved to the local disk or streamed to a cloud storage service like AWS S3.

## Features

-   **RESTful Endpoints**: Dedicated endpoints for audio (`POST /upload/audio`) and video (`POST /upload/video`).
-   **Multipart/Form-Data Handling**: Efficiently processes file uploads using `multer`.
-   **Input Validation**: Strict validation for content types (e.g., `audio/mpeg`, `video/mp4`) and configurable size limits.
-   **Database Integration**: Uses **Sequelize ORM** to connect with a **PostgreSQL** database, storing metadata for every uploaded file.
-   **Flexible Storage Options**: Supports saving files to the local server disk (`/uploads` folder) or to a cloud storage provider (stubbed for AWS S3).
-   **Professional Structure**: Organized into controllers, services, models, and routes for maintainability and scalability.
-   **Environment-Based Configuration**: Manages all sensitive data and configurations securely through a `.env` file.

## Project Structure

The project follows a clean, modular structure to separate concerns, making it easy to navigate and extend.

```
.
.
├── src
│   ├── api
│   │   ├── controllers
│   │   │   └── upload.controller.js
│   │   ├── middlewares
│   │   │   ├── errorHandler.js
│   │   │   └── validation.js
│   │   ├── models
│   │   │   ├── file.model.js
│   │   │   └── index.js
│   │   ├── routes
│   │   │   └── upload.routes.js
│   │   └── services
│   │       ├── s3.service.js
│   │       └── upload.service.js
│   ├── config
│   │   ├── database.js
│   │   ├── index.js
│   │   └── multer.js
│   ├── app.js
│   └── server.js
├── .env
├── .gitignore
├── package.json
├── README.md
└── uploads/
```

## Requirements

To run this project, you will need the following installed on your machine:

-   [Node.js](https://nodejs.org/en/) (v18.x or newer recommended)
-   [npm](https://www.npmjs.com/) (comes with Node.js)
-   [PostgreSQL](https://www.postgresql.org/download/)
-   A database management tool like [DBeaver](https://dbeaver.io/) or PgAdmin to set up and inspect the database.

## Installation and Setup

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/FlomadLabsRD/Caipo-flomad-labs-updated
cd Caipo-flomad-labs-updated
git checkout upload_API_videos_audios
```

### 2. Install Dependencies

Install all the required npm packages listed in `package.json`.

```bash
npm install
```

### 3. Set Up the PostgreSQL Database

1.  Open DBeaver (or your preferred SQL client) and connect to your PostgreSQL instance.
2.  Create a new database. You can name it whatever you like, for example, `file_uploads`.
3.  The application will automatically create the required `Files` table when it starts for the first time.

### 4. Configure Environment Variables

Create a file named `.env` in the root of the project directory. Copy the contents of the example below and replace the placeholder values with your actual PostgreSQL credentials.

```env
# Server Configuration
PORT=3000

# Database Configuration
# Replace user, password, host, port, and db_name with your credentials
DATABASE_URL="postgresql://user:password@host:port/db_name"
# Example:
# DATABASE_URL="postgresql://postgres:1234@localhost:5432/file_uploads"

# File Upload Limits
MAX_AUDIO_SIZE=5242880 # 5MB
MAX_VIDEO_SIZE=10485760 # 10MB

# AWS S3 Stub Configuration (Optional)
# These are only needed if you implement the S3 service
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
```

## Running the Application

Once the setup is complete, you can start the server with the following command:

```bash
npm start
```

You should see the following output in your terminal, indicating that the server is running and connected to the database:

```
PostgreSQL connection has been established successfully.
All models were synchronized successfully.
Server is running on port 3000
```
