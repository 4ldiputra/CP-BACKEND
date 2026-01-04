const express = require('express');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const addressRoutes = require('./routes/address');
const orderRoutes = require('./routes/order');
const paymentRoutes = require('./routes/payment');
const productRoutes = require('./routes/products');
const articleRoutes = require('./routes/articles');
const suggestionRoutes = require('./routes/suggestions');
const db = require('./config/database');

const app = express();


const uploadsProfile = path.join(__dirname, 'uploads/profiles');
if (!fs.existsSync(uploadsProfile)) {
  fs.mkdirSync(uploadsProfile, { recursive: true });
  console.log('Created:', uploadsProfile);
}


const uploadsProducts = path.join(__dirname, 'uploads/products');
if (!fs.existsSync(uploadsProducts)) {
  fs.mkdirSync(uploadsProducts, { recursive: true });
  console.log('Created:', uploadsProducts);
}
const uploadsArticles = path.join(__dirname, 'uploads/articles');
if (!fs.existsSync(uploadsArticles)) {
  fs.mkdirSync(uploadsArticles, { recursive: true });
  console.log('Created:', uploadsArticles);
}


const sessionStore = new MySQLStore({
  expiration: 86400000,
  createDatabaseTable: true,
  schema: {
    tableName: 'user_sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, db);



const allowedOrigins = [
  'http://localhost:5173', // Vite dev
  'http://127.0.0.1:5173',
  'https://mayuna.store',
  'https://www.mayuna.store',
  'https://api.mayuna.store'
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true // ⭐ WAJIB untuk session cookie
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  key: 'session_cookie_name',
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 86400000,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  }
}));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



app.use('/api/auth', authRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/suggestions', suggestionRoutes);
app.use('/api/products', paymentRoutes);



app.get('/', (req, res) => {
  res.json({
    message: 'E-commerce API is running!',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
        updateProfile: 'POST /api/auth/profile',
        getAllMitra: 'GET /api/auth/mitra (Admin only)',
        getAllUser: 'GET /api/auth/user (Admin only)',
        updateUserById: 'PUT /api/auth/user/:id (Admin only)',
        deleteUserById: 'DELETE /api/auth/user/:id (Admin only)'
      },
      cart: {
        getCartCount: 'GET /api/auth/cart/count',
        getCart: 'GET /api/auth/cart',
        addToCart: 'POST /api/auth/cart/add',
        updateCartItem: 'PUT /api/auth/cart/update/:id',
        removeCartItem: 'DELETE /api/auth/cart/remove/:id',
        addNotes: 'POST /api/auth/cart/notes/:id'
      },
      address: {
        getAll: 'GET /api/address',
        getOne: 'GET /api/address/:id',
        create: 'POST /api/address',
        update: 'PUT /api/address/:id',
        delete: 'DELETE /api/address/:id'
      },
      order: {
        getAll: 'GET /api/order',
        getOne: 'GET /api/order/:id',
        create: 'POST /api/order',
        updateStatus: 'PUT /api/order/:id/status'
      },
      products: {
        uploadMitra: 'POST /api/products/mitra',
        uploadUser: 'POST /api/products/user',
        getMitra: 'GET /api/products/mitra',
        getUser: 'GET /api/products/user',
        editMitra: 'PUT /api/products/mitra/:id',
        editUser: 'PUT /api/products/user/:id',
        deleteMitra: 'DELETE /api/products/mitra/:id',
        deleteUser: 'DELETE /api/products/user/:id',
        getAll: 'GET /api/products/categories',
        add: 'POST /api/products/categories',
        update: 'PUT /api/products/categories/:id',
        delete: 'DELETE /api/products/categories/:id',
        add: 'POST /api/products/subcategories',
        update: 'PUT /api/products/subcategories/:id',
      }
    }
  });
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
