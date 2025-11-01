const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// In-memory database for products
let products = [
  {
    id: 1,
    name: "Laptop",
    description: "High-performance laptop for professionals",
    price: 1299.99,
    category: "Electronics",
    inStock: true
  },
  {
    id: 2,
    name: "Desk Chair",
    description: "Ergonomic office chair",
    price: 249.99,
    category: "Furniture",
    inStock: true
  }
];

let nextId = 3;

// Custom Error Classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

// Middleware: Logger
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

// Middleware: JSON Parser
app.use(express.json());

// Middleware: Logger
app.use(logger);

// Middleware: Authentication
const authenticate = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== 'secret-api-key-123') {
    throw new AuthenticationError('Invalid or missing API key');
  }
  
  next();
};

// Middleware: Validation for product creation/update
const validateProduct = (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    throw new ValidationError('Name is required and must be a non-empty string');
  }
  
  if (!description || typeof description !== 'string') {
    throw new ValidationError('Description is required and must be a string');
  }
  
  if (price === undefined || typeof price !== 'number' || price < 0) {
    throw new ValidationError('Price is required and must be a non-negative number');
  }
  
  if (!category || typeof category !== 'string') {
    throw new ValidationError('Category is required and must be a string');
  }
  
  if (inStock === undefined || typeof inStock !== 'boolean') {
    throw new ValidationError('inStock is required and must be a boolean');
  }
  
  next();
};

// Async wrapper for error handling
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Hello World' });
});

// GET /api/products - List all products with filtering and pagination
app.get('/api/products', (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  
  let filteredProducts = products;
  
  // Filter by category if provided
  if (category) {
    filteredProducts = products.filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }
  
  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    total: filteredProducts.length,
    page: pageNum,
    limit: limitNum,
    totalPages: Math.ceil(filteredProducts.length / limitNum),
    data: paginatedProducts
  });
});

// GET /api/products/search - Search products by name
app.get('/api/products/search', (req, res) => {
  const { name } = req.query;
  
  if (!name) {
    throw new ValidationError('Search name parameter is required');
  }
  
  const results = products.filter(p => 
    p.name.toLowerCase().includes(name.toLowerCase())
  );
  
  res.json({
    total: results.length,
    data: results
  });
});

// GET /api/products/statistics - Get product statistics
app.get('/api/products/statistics', (req, res) => {
  const stats = {};
  
  products.forEach(p => {
    if (!stats[p.category]) {
      stats[p.category] = {
        count: 0,
        totalValue: 0,
        inStock: 0
      };
    }
    stats[p.category].count++;
    stats[p.category].totalValue += p.price;
    if (p.inStock) {
      stats[p.category].inStock++;
    }
  });
  
  res.json({
    totalProducts: products.length,
    categoryCounts: stats
  });
});

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  
  if (!product) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  res.json(product);
});

// POST /api/products - Create a new product (with authentication and validation)
app.post('/api/products', authenticate, validateProduct, (req, res) => {
  const newProduct = {
    id: nextId++,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    inStock: req.body.inStock
  };
  
  products.push(newProduct);
  
  res.status(201).json({
    message: 'Product created successfully',
    product: newProduct
  });
});

// PUT /api/products/:id - Update an existing product (with authentication and validation)
app.put('/api/products/:id', authenticate, validateProduct, (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  products[index] = {
    id: id,
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    inStock: req.body.inStock
  };
  
  res.json({
    message: 'Product updated successfully',
    product: products[index]
  });
});

// DELETE /api/products/:id - Delete a product
app.delete('/api/products/:id', authenticate, (req, res) => {
  const id = parseInt(req.params.id);
  const index = products.findIndex(p => p.id === id);
  
  if (index === -1) {
    throw new NotFoundError(`Product with ID ${id} not found`);
  }
  
  const deletedProduct = products.splice(index, 1)[0];
  
  res.json({
    message: 'Product deleted successfully',
    product: deletedProduct
  });
});

// 404 Handler for undefined routes
app.use((req, res, next) => {
  throw new NotFoundError(`Route ${req.method} ${req.url} not found`);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      name: err.name || 'Error',
      message: message,
      statusCode: statusCode
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API Key for testing: secret-api-key-123`);
});

module.exports = app;
