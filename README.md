# ERP System

A modern ERP system built with Express.js backend and React frontend.

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- PostgreSQL database
- npm or yarn

### Backend Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Database Configuration:**
   - Copy `config.env.example` to `.env`
   - Update the database credentials in `.env`:
     ```
     DB_HOST=localhost
     DB_USER=admin
     DB_PASSWORD=pass123
     DB_NAME=erp_db
     DB_PORT=5432
     ```

3. **Create PostgreSQL Database:**

   ```sql
   CREATE DATABASE erp_db;
   CREATE USER admin WITH PASSWORD 'pass123';
   GRANT ALL PRIVILEGES ON DATABASE erp_db TO admin;
   ```

4. **Start the server:**

   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Production mode
   npm start
   ```

### Frontend Setup

1. **Navigate to client directory:**

   ```bash
   cd client
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start React development server:**
   ```bash
   npm start
   ```

## 📁 Project Structure

```
erp-system/
├── config/
│   └── database.js          # Database configuration
├── client/                  # React frontend
├── server.js                # Express server
├── package.json
└── README.md
```

## 🔧 Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run tests

### Code Quality Scripts
- `npm run lint` - Check code with ESLint
- `npm run lint:fix` - Fix auto-fixable ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted
- `npm run code-quality` - Run both linting and format checking

## 🌐 API Endpoints

- `GET /` - API status
- `GET /health` - Health check

## 🗄️ Database

The system uses PostgreSQL with Sequelize ORM. Make sure your PostgreSQL server is running and accessible with the credentials specified in your `.env` file.

## 🔒 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DB_HOST=localhost
DB_USER=admin
DB_PASSWORD=pass123
DB_NAME=erp_db
DB_PORT=5432
NODE_ENV=development
PORT=5000
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000
```

## 📝 Next Steps

1. Set up your database models using Sequelize
2. Create API routes for your ERP modules
3. Implement authentication and authorization
4. Build the React frontend components
5. Set up state management (Redux/Context API)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
