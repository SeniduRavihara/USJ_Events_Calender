# Modern PHP API-First Application

A modern PHP application built with an API-first architecture, featuring a separate frontend and backend. This project demonstrates best practices for building scalable web applications with PHP.

## Project Structure

```
USJ_Events_Calender/
├── api/                    # Backend API endpoints
│   ├── login.php          # Authentication endpoint
│   ├── register.php       # User registration
│   ├── profile.php        # User profile management
│   ├── posts.php          # Post management
│   ├── stats.php          # User statistics
│   ├── activity.php       # User activity feed
│   └── update_password.php # Password management
├── config/                # Configuration files
│   ├── db.php            # Database configuration
│   └── env.php           # Environment variables
├── database/             # Database management
│   ├── migrations/       # Database migrations
│   └── seeds/           # Database seeders
├── public_html/          # Frontend application
│   ├── index.html       # Main application page
│   └── script.js        # Frontend JavaScript
├── vendor/              # Composer dependencies
├── composer.json        # PHP dependencies
├── composer.lock        # Locked PHP dependencies
├── phinx.php           # Phinx configuration
└── README.md           # Project documentation
```

## Architecture Overview

### API-First Architecture

This project follows an API-first architecture, which means:

1. **Clear Separation of Concerns**

   - Backend (API) handles data and business logic
   - Frontend handles presentation and user interaction
   - Communication through RESTful API endpoints

2. **Benefits**

   - Frontend and backend can be developed independently
   - Multiple clients can consume the same API (web, mobile, desktop)
   - Easier to scale and maintain
   - Better security through centralized authentication

3. **Technology Stack**
   - Backend: PHP with PDO for database access
   - Authentication: JWT (JSON Web Tokens)
   - Frontend: HTML, JavaScript, Tailwind CSS
   - Database: MySQL/MariaDB
   - Migration Tool: Phinx

### Database Management

The project uses Phinx for database migrations and seeding. This ensures:

1. **Version Control for Database**

   - Track database changes
   - Easy rollback if needed
   - Consistent database structure across environments

2. **Migration Commands**

```bash
# Create a new migration
vendor/bin/phinx create MyNewMigration

# Run all pending migrations
vendor/bin/phinx migrate

# Rollback the last migration
vendor/bin/phinx rollback

# Rollback all migrations
vendor/bin/phinx rollback -t 0

# Check migration status
vendor/bin/phinx status
```

3. **Seeding Commands**

```bash
# Create a new seeder
vendor/bin/phinx seed:create MyNewSeeder

# Run all seeders
vendor/bin/phinx seed:run

# Run a specific seeder
vendor/bin/phinx seed:run -s MySeeder
```

### Database Structure

The application uses the following main tables:

1. **users**

   - id (Primary Key)
   - name
   - email
   - password (hashed)
   - created_at
   - updated_at

2. **posts**

   - id (Primary Key)
   - user_id (Foreign Key)
   - title
   - content
   - created_at
   - updated_at

3. **comments**
   - id (Primary Key)
   - user_id (Foreign Key)
   - post_id (Foreign Key)
   - content
   - created_at
   - updated_at

## Setup Instructions

1. **Clone the Repository**

   ```bash
   git clone <repository-url>
   cd USJ_Events_Calender
   ```

2. **Install Dependencies**

   ```bash
   composer install
   ```

3. **Configure Environment**

   - Copy `.env.example` to `.env`
   - Update database credentials and JWT secret

4. **Run Database Migrations**

   ```bash
   vendor/bin/phinx migrate
   ```

5. **Seed the Database (Optional)**

   ```bash
   vendor/bin/phinx seed:run
   ```

6. **Configure Web Server**
   - Point document root to `public_html/`
   - Ensure API endpoints are accessible

## API Endpoints

### Authentication

- `POST /api/register.php` - Register new user
- `POST /api/login.php` - User login
- `POST /api/update_password.php` - Update user password

### User Management

- `GET /api/profile.php` - Get user profile
- `GET /api/stats.php` - Get user statistics
- `GET /api/activity.php` - Get user activity feed

### Content Management

- `POST /api/posts.php` - Create new post
- `GET /api/posts.php` - Get user posts
- `POST /api/comments.php` - Add comment to post

## Security Features

1. **JWT Authentication**

   - Secure token-based authentication
   - Token expiration
   - Protected API endpoints

2. **Password Security**

   - Password hashing using PHP's password_hash()
   - Secure password update process
   - Password confirmation checks

3. **Input Validation**
   - Server-side validation
   - SQL injection prevention using prepared statements
   - XSS protection

## Frontend Features

1. **Modern UI with Tailwind CSS**

   - Responsive design
   - Clean and intuitive interface
   - Consistent styling

2. **User Dashboard**

   - Statistics overview
   - Recent activity feed
   - Quick actions

3. **Real-time Updates**
   - Automatic data refresh
   - Smooth transitions
   - Error handling

## Development Guidelines

1. **Code Style**

   - Follow PSR-12 coding standards
   - Use meaningful variable and function names
   - Add comments for complex logic

2. **Git Workflow**

   - Create feature branches
   - Write meaningful commit messages
   - Submit pull requests for review

3. **Testing**
   - Test API endpoints
   - Verify frontend functionality
   - Check responsive design

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details .
