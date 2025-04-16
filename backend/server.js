const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise'); // Use the promise-based version

// Create the connection pool (adjust as needed for your DB)
const connection = mysql.createPool({ host: 'localhost', user: 'root', database: 'storemate' });

const app = express();

app.use(cors());
app.use(bodyParser.json());

// API endpoint to add a product
app.post('/products', async (req, res) => {
  const { product_name, product_price, product_stock } = req.body;

  // Validate input
  if (!product_name || !product_price || !product_stock) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const query = 'INSERT INTO products (product_name, product_price, product_stock) VALUES (?, ?, ?)';
  try {
    const [result] = await connection.execute(query, [product_name, product_price, product_stock]);
    res.status(200).json({ message: 'Product added successfully', data: result });
  } catch (err) {
    console.error('Error adding product:', err);
    return res.status(500).json({ message: 'Error adding product' });
  }
});

// API endpoint to view inventory
app.get('/products', async (req, res) => {
  const query = 'SELECT * FROM products';
  try {
    const [result] = await connection.execute(query);
    if (result.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }
    res.status(200).json({ data: result });
  } catch (err) {
    console.error('Error fetching products:', err);
    return res.status(500).json({ message: 'Error fetching products' });
  }
});

// API endpoint to update product stock
app.put('/products/:id', async (req, res) => {
  const productId = req.params.id; // Get product ID from URL parameters
  const { product_stock } = req.body; // Get new stock quantity from request body

  // Check if the new stock value is valid
  if (product_stock === undefined || product_stock < 0) {
    return res.status(400).json({ message: 'Valid stock value is required' });
  }

  const query = 'UPDATE products SET product_stock = ? WHERE product_id = ?';
  try {
    const [result] = await connection.execute(query, [product_stock, productId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product stock updated successfully' });
  } catch (err) {
    console.error('Error updating product stock:', err);
    return res.status(500).json({ message: 'Error updating product stock' });
  }
});

// API to delete product from inventory
app.delete('/products/:id', async (req, res) => {
  const productId = req.params.id;

  const query = 'DELETE FROM products WHERE product_id = ?';
  try {
    const [result] = await connection.execute(query, [productId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Error deleting product' });
  }
});

// API endpoint to log sale and add to sales history
app.post('/sales', async (req, res) => {
  console.log('Received request:', req.body);
  const { product_id, sale_quantity, customer_name, customer_phone, payment_status } = req.body;

  // Validate input
  if (!product_id || !sale_quantity || !customer_name || !customer_phone || !payment_status) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const saleQuery = 'INSERT INTO sales (product_id, sale_quantity, customer_name, customer_phone, payment_status) VALUES (?, ?, ?, ?, ?)';
  
  try {
    const [saleResult] = await connection.execute(saleQuery, [product_id, sale_quantity, customer_name, customer_phone, payment_status]);

    // Fetch product details
    const productQuery = 'SELECT product_price FROM products WHERE product_id = ?';
    const [productResult] = await connection.execute(productQuery, [product_id]);

    if (productResult.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const sale_price = productResult[0].product_price;
    const total_amount = sale_quantity * sale_price;

    // Insert into sales_history
    const historyQuery = 'INSERT INTO sales_history (sale_id, product_id, sale_quantity, sale_price, total_amount, sale_date, customer_name, customer_phone, payment_status) VALUES (?, ?, ?, ?, ?, NOW(), ?, ?, ?)';
    await connection.execute(historyQuery, [saleResult.insertId, product_id, sale_quantity, sale_price, total_amount, customer_name, customer_phone, payment_status]);

    // Insert into payments table if payment status is 'due'
    if (payment_status.toLowerCase() === 'due') {
      const paymentQuery = 'INSERT INTO payments (customer_name, customer_phone, due_amount) VALUES (?, ?, ?)';
      await connection.execute(paymentQuery, [customer_name, customer_phone, total_amount]);
    }

    // Update product stock
    const updateStockQuery = 'UPDATE products SET product_stock = product_stock - ? WHERE product_id = ?';
    await connection.execute(updateStockQuery, [sale_quantity, product_id]);

    res.status(200).json({ message: 'Sale logged and history updated successfully', saleId: saleResult.insertId });
  } catch (err) {
    console.error('Error logging sale:', err);
    return res.status(500).json({ message: 'Error logging sale', error: err });
  }
});


// API endpoint to fetch sales history
app.get('/sales_history', async (req, res) => {
  const query = 'SELECT sh.* FROM sales_history sh ORDER BY sh.sale_date DESC'; // No join with products
  try {
    const [result] = await connection.execute(query);
    res.status(200).json({ data: result });
  } catch (err) {
    console.error('Error fetching sales history:', err);
    return res.status(500).json({ message: 'Error fetching sales history' });
  }
});

// API endpoint to save customer payment
app.post('/payments', async (req, res) => {
  const { customer_name, customer_phone, due_amount } = req.body;

  // Validate input
  if (!customer_name || !due_amount) {
    return res.status(400).json({ message: 'Customer name and due amount are required' });
  }

  const query = 'INSERT INTO payments (customer_name, customer_phone, due_amount) VALUES (?, ?, ?)';
  
  try {
    // Using async/await with connection.execute instead of query
    const [result] = await connection.execute(query, [customer_name, customer_phone, due_amount]);
    res.status(200).json({ message: 'Payment details saved successfully', data: result });
  } catch (err) {
    console.error('Error saving payment:', err);
    return res.status(500).json({ message: 'Error saving payment details' });
  }
});

// API endpoint to view pending payments
app.get('/payments', async (req, res) => {
  const query = 'SELECT * FROM payments WHERE due_amount > 0';
  
  try {
    // Using async/await with connection.execute
    const [result] = await connection.execute(query);
    res.status(200).json({ data: result });
  } catch (err) {
    console.error('Error fetching pending payments:', err);
    return res.status(500).json({ message: 'Error fetching pending payments' });
  }
});

//API end point to delete payment record
app.delete('/payments/:id', async (req, res) => {
  const paymentId = req.params.id;

  const query = 'DELETE FROM payments WHERE payment_id = ?';
  try {
    const [result] = await connection.execute(query, [paymentId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    res.status(200).json({ message: 'Payment record deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment record:', error);
    res.status(500).json({ message: 'Error deleting payment record' });
  }
});


// Start the server
app.listen(5000, () => {
  console.log('Server running on port 5000');
});
