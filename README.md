# Express File Upload API

This project is a robust prototype of an Express.js server designed to handle **audio and video file uploads**.  
It features a professional and scalable project structure, validation for file types and size limits, and seamless integration with a **PostgreSQL** database to store file metadata.  
Files are saved locally in the `/uploads` folder.

---

## Features

- **RESTful Endpoints**: Dedicated endpoints for audio (`POST /upload/audio`) and video (`POST /upload/video`).
- **Multipart/Form-Data Handling**: Efficiently processes file uploads using `multer`.
- **Input Validation**: Strict validation for content types (e.g., `audio/mpeg`, `video/mp4`) and configurable size limits.
- **Database Integration**: Uses **Sequelize ORM** to connect with a **PostgreSQL** database, storing metadata for every uploaded file.
- **File Storage**: Saves files to the local `/uploads` directory and records details in the database.
- **Professional Structure**: Organized into controllers, services, models, and routes for maintainability and scalability.
- **Environment-Based Configuration**: Manages all sensitive data and configurations securely through a `.env` file.

---
## 📁 Project Structure

The project follows a clean, modular structure to separate concerns, making it easy to navigate and extend.

```bash
.
├── src
│   ├── api
│   │   ├── controllers
│   │   │   └── upload.controller.js         # Handles audio/video upload logic
│   │   ├── middlewares
│   │   │   ├── errorHandler.js              # Global error handler
│   │   │   └── validation.js                # File type and size validation
│   │   ├── models
│   │   │   ├── file.model.js                # Sequelize model for uploaded files
│   │   │   └── index.js                     # Sequelize DB initialization
│   │   ├── routes
│   │   │   └── upload.routes.js             # Defines /upload/audio & /upload/video endpoints
│   │   └── services
│   │       └── upload.service.js            # Handles file saving and DB logic
│   ├── config
│   │   ├── database.js                      # DB connection config (Sequelize)
│   │   ├── index.js                         # Loads config files
│   │   └── multer.js                        # Multer setup for uploads
│   ├── app.js                               # Sets up Express app, routes, middleware
│   └── server.js                            # Starts server and connects to DB
├── tests
│   ├── audio                                # Sample test audio files
│   └── video                                # Sample test video files
├── uploads                                  # Stores uploaded media files
├── .env                                     # Environment variables
├── .gitignore                               # Ignored files/folders in Git
├── package.json                             # Project metadata and dependencies
├── package-lock.json                        # Dependency lock file
├── project.tree                             # (Optional) File/folder listing snapshot
└── README.md                                # Project documentation (this file)
```

---

## Requirements

To run this project, you will need the following installed on your machine:

- [Node.js](https://nodejs.org/en/) (v18.x or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [PostgreSQL](https://www.postgresql.org/download/)
- A database management tool like [DBeaver](https://dbeaver.io/) or PgAdmin to set up and inspect the database.

---

## Installation and Setup

Follow these steps to get the project running on your local machine.

### 1. Clone the Repository

```bash
git clone https://github.com/FlomadLabsRD/Caipo-flomad-labs-updated
cd Caipo-flomad-labs-updated
git checkout upload_API_videos_audios
2. Install Dependencies
Install all required npm packages listed in package.json.

bash
Copy code
npm install
3. Set Up the PostgreSQL Database
Open DBeaver (or your preferred SQL client) and connect to your PostgreSQL instance.

Create a new database, for example file_uploads.

The application will automatically create the required Files table when it starts for the first time.

4. Configure Environment Variables
Create a .env file in the root directory and replace placeholders with your PostgreSQL credentials.

env
Copy code
# Server Configuration
PORT=3000

# Database Configuration
DATABASE_URL="postgresql://postgres@localhost:5432/file_uploads"

# File Upload Limits
MAX_AUDIO_SIZE=5242880 # 5MB
MAX_VIDEO_SIZE=10485760 # 10MB
Running the Application
Once setup is complete, start the server:

bash
Copy code
npm start
Expected output:

pgsql
Copy code
PostgreSQL connection has been established successfully.
All models were synchronized successfully.
Server is running on port 3000
Testing File Uploads
Use Postman or curl to test the endpoints.

Upload Audio
bash
Copy code
curl -X POST http://localhost:3000/upload/audio \
  -F "file=@tests/audio/less5M.mp3"
Upload Video
bash
Copy code
curl -X POST http://localhost:3000/upload/video \
  -F "file=@tests/video/sample.mp4"
Uploaded files will appear in /uploads, and metadata will be stored in your PostgreSQL Files table.


---

## next step


1. Open your `README.md` in VS Code or your terminal (`nano README.md`).  
2. Replace its content with the updated text above.  
3. Save and push:

```bash
git add README.md
git commit -m "📝 Updated README: local storage + PostgreSQL setup (no AWS)"
git push origin upload_API_videos_audios
