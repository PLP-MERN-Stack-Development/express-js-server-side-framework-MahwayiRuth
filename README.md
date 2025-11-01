# Express.js RESTful API - Week 2 Assignment

A fully functional RESTful API built with Express.js that implements CRUD operations for a products resource with proper routing, middleware, error handling, and advanced features.

## Features

- ✅ Complete CRUD operations for products
- ✅ Custom middleware (logger, authentication, validation)
- ✅ Global error handling with custom error classes
- ✅ Query parameters for filtering by category
- ✅ Pagination support
- ✅ Search functionality
- ✅ Statistics endpoint
- ✅ Proper HTTP status codes
- ✅ In-memory data storage

## Installation

1. **Initialize the project:**
```bash
npm init -y
```

2. **Install dependencies:**
```bash
npm install express
npm install --save-dev nodemon
```

3. **Create the server.js file** with the code provided

4. **Run the server:**
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

The server will start on `http://localhost:3000`

## API Endpoints

### Root Endpoint
- **GET /** - Returns "Hello World" message

### Products Endpoints

#### 1. List All Products
- **GET /api/products**
- Query Parameters:
  - `category` (optional): Filter by category
  - `page` (optional, default: 1): Page number
  - `limit` (optional, default: 10): Items per page

**Example Request:**
```bash
curl http://localhost:3000/api/products?category=Electronics&page=1&limit=5
```

**Example Response:**
```json
{
  "total": 1,
  "page": 1,
  "limit": 5,
  "totalPages": 1,
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop for professionals",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ]
}
```

#### 2. Get Product by ID
- **GET /api/products/:id**

**Example Request:**
```bash
curl http://localhost:3000/api/products/1
```

**Example Response:**
```json
{
  "id": 1,
  "name": "Laptop",
  "description": "High-performance laptop for professionals",
  "price": 1299.99,
  "category": "Electronics",
  "inStock": true
}
```

#### 3. Search Products by Name
- **GET /api/products/search?name={searchTerm}**

**Example Request:**
```bash
curl "http://localhost:3000/api/products/search?name=laptop"
```

**Example Response:**
```json
{
  "total": 1,
  "data": [
    {
      "id": 1,
      "name": "Laptop",
      "description": "High-performance laptop for professionals",
      "price": 1299.99,
      "category": "Electronics",
      "inStock": true
    }
  ]
}
```

#### 4. Get Product Statistics
- **GET /api/products/statistics**

**Example Request:**
```bash
curl http://localhost:3000/api/products/statistics
```

**Example Response:**
```json
{
  "totalProducts": 2,
  "categoryCounts": {
    "Electronics": {
      "count": 1,
      "totalValue": 1299.99,
      "inStock": 1
    },
    "Furniture": {
      "count": 1,
      "totalValue": 249.99,
      "inStock": 1
    }
  }
}
```

#### 5. Create New Product
- **POST /api/products**
- **Requires Authentication:** Add `x-api-key: secret-api-key-123` header
- **Request Body:**

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-api-key-123" \
  -d '{
    "name": "Smartphone",
    "description": "Latest model smartphone",
    "price": 899.99,
    "category": "Electronics",
    "inStock": true
  }'
```

**Example Response:**
```json
{
  "message": "Product created successfully",
  "product": {
    "id": 3,
    "name": "Smartphone",
    "description": "Latest model smartphone",
    "price": 899.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

#### 6. Update Product
- **PUT /api/products/:id**
- **Requires Authentication:** Add `x-api-key: secret-api-key-123` header

**Example Request:**
```bash
curl -X PUT http://localhost:3000/api/products/1 \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-api-key-123" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1499.99,
    "category": "Electronics",
    "inStock": true
  }'
```

**Example Response:**
```json
{
  "message": "Product updated successfully",
  "product": {
    "id": 1,
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1499.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

#### 7. Delete Product
- **DELETE /api/products/:id**
- **Requires Authentication:** Add `x-api-key: secret-api-key-123` header

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/products/1 \
  -H "x-api-key: secret-api-key-123"
```

**Example Response:**
```json
{
  "message": "Product deleted successfully",
  "product": {
    "id": 1,
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop",
    "price": 1499.99,
    "category": "Electronics",
    "inStock": true
  }
}
```

## Middleware Implementation

### 1. Logger Middleware
Logs all incoming requests with timestamp, method, and URL.

### 2. JSON Parser Middleware
Parses JSON request bodies.

### 3. Authentication Middleware
Checks for API key in request headers (`x-api-key`).
- **API Key:** `secret-api-key-123`

### 4. Validation Middleware
Validates product data for POST and PUT requests:
- `name`: Required, non-empty string
- `description`: Required string
- `price`: Required, non-negative number
- `category`: Required string
- `inStock`: Required boolean

## Error Handling

The API includes custom error classes and global error handling:

### Custom Error Classes
- **NotFoundError** (404): Resource not found
- **ValidationError** (400): Invalid request data
- **AuthenticationError** (401): Missing or invalid API key

### Error Response Format
```json
{
  "error": {
    "name": "ValidationError",
    "message": "Price is required and must be a non-negative number",
    "statusCode": 400
  }
}
```

## Testing Examples

### Test Authentication Error
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Test", "description": "Test", "price": 10, "category": "Test", "inStock": true}'
```

Expected: 401 Authentication Error

### Test Validation Error
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -H "x-api-key: secret-api-key-123" \
  -d '{"name": "", "description": "Test", "price": -5, "category": "Test", "inStock": true}'
```

Expected: 400 Validation Error

### Test Not Found Error
```bash
curl http://localhost:3000/api/products/999
```

Expected: 404 Not Found Error

## Project Structure
```
express-restful-api/
├── server.js          # Main server file with all routes and middleware
├── package.json       # Project dependencies and scripts
├── .env.example       # Example environment variables
└── README.md          # This file
```

## Environment Variables

Create a `.env.example` file with:
```
PORT=3000
API_KEY=secret-api-key-123
```

## Assignment Requirements Checklist

✅ **Task 1: Express.js Setup**
- Initialize Node.js project
- Install Express.js
- Create basic Express server on port 3000
- Implement "Hello World" route at root endpoint

✅ **Task 2: RESTful API Routes**
- Create products resource with all fields
- Implement all CRUD operations (GET, POST, PUT, DELETE)
- Proper routing structure

✅ **Task 3: Middleware Implementation**
- Custom logger middleware
- JSON request body parser
- Authentication middleware (API key)
- Validation middleware for product routes

✅ **Task 4: Error Handling**
- Global error handling middleware
- Custom error classes (NotFoundError, ValidationError, AuthenticationError)
- Proper HTTP status codes
- Async error handling with try/catch wrapper

✅ **Task 5: Advanced Features**
- Query parameters for filtering by category
- Pagination support
- Search endpoint for products by name
- Statistics endpoint (count by category)

## Tips for Mobile Development

Since you're working on mobile:
1. Use a text editor app that supports coding
2. Test the API using apps like:
   - **HTTP Request Maker**
   - **REST Client**
   - **API Tester**
3. You can also use online tools like **Replit** or **CodeSandbox** for coding and testing
4. Make sure to copy all files (server.js, package.json, README.md, .env.example)

## License

ISC
