# SCSU Student Forum

A web-based forum application for SCSU students built with Node.js and vanilla JavaScript.

## Project Overview

This project implements a student forum platform with the following features:
- User account management
- Forum discussions organized by topics
- Messaging system
- Responsive design with a clean user interface

## Project Structure

```
.
├── app.js                  # Application setup and main request handler
├── config/                 # Configuration files
│   └── database.js        # Database connection setup
├── controllers/           # Request handling logic
│   ├── handlers/         # HTTP method-specific handlers
│   └── requestController.js
├── models/               # Database models
│   ├── Forum.js         # Forum-related database operations
│   ├── Message.js       # Message-related database operations
│   └── User.js          # User-related database operations
├── public/              # Static assets
│   ├── css/            # Stylesheets
│   └── js/             # Client-side JavaScript
├── services/           # Business logic services
├── utils/              # Utility functions
├── views/              # HTML templates
│   ├── pages/          # Page templates
│   ├── partials/       # Reusable page components
│   └── templates/      # Dynamic content templates
└── server.js           # Server entry point
```

## Prerequisites

- Node.js (Latest LTS version recommended)
- MySQL Server
- npm (Node Package Manager)

## Database Setup

1. Create a MySQL database named `scsuforum`
2. The database requires the following tables:
   - users
   - forums
   - posts
   - messages

Example database schema:
```sql
CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'owl'
);

CREATE TABLE forums (
    forum_id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT
);
```

## Installation

1. Clone the repository:
```bash
git clone [repository-url]
```

2. Install dependencies:
```bash
npm install
```

3. Configure the database connection in `config/database.js`

4. Start the server:
```bash
node server.js
```

The application will be available at `http://localhost:80`

## Key Components

### Backend

- **Server**: Uses Node.js native HTTP server
- **Database**: MySQL with connection pooling
- **Request Handling**: Custom routing system with method-based handlers
- **Template Service**: Custom HTML template processing

### Frontend

- **Templating**: Custom template system with partials support
- **API Integration**: Fetch-based API calls
- **Navigation**: History API-based navigation
- **Styling**: Custom CSS with responsive design

## API Endpoints

### Users
- `GET /api/users` - Retrieve all users
- `POST /api/users/create` - Create new user

### Forums
- `GET /api/forums` - Retrieve all forums
- `GET /api/forums/:id` - Retrieve specific forum
- `GET /api/forums/posts/:id` - Retrieve posts for a specific forum

## File Types

- `.js` - JavaScript source files
- `.html` - HTML templates and pages
- `.css` - Stylesheet files

## Error Handling

The application implements consistent error handling:
- Client-side errors are displayed to users
- Server-side errors are logged and generic messages returned
- Database errors are caught and handled appropriately
