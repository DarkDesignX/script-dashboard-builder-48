import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initializeDatabase, runQuery, getQuery, allQuery } from './database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Initialize database on startup
try {
  await initializeDatabase();
  console.log('Database initialized successfully');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}

// Helper function to get script with customers
async function getScriptWithCustomers(scriptId) {
  const script = await getQuery('SELECT * FROM scripts WHERE id = ?', [scriptId]);
  if (!script) return null;

  const customers = await allQuery(`
    SELECT c.id, c.name 
    FROM customers c
    JOIN script_customers sc ON c.id = sc.customerId 
    WHERE sc.scriptId = ?
  `, [scriptId]);

  return {
    ...script,
    isGlobal: Boolean(script.isGlobal),
    autoEnrollment: Boolean(script.autoEnrollment),
    customers: customers.map(c => c.id),
    createdAt: new Date(script.createdAt),
    updatedAt: new Date(script.updatedAt)
  };
}

// API Routes

// GET /api/customers - Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await allQuery('SELECT * FROM customers ORDER BY name');
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// POST /api/customers - Create a new customer
app.post('/api/customers', async (req, res) => {
  try {
    const { id, name } = req.body;
    if (!id || !name) {
      return res.status(400).json({ error: 'Customer id and name are required' });
    }

    await runQuery('INSERT INTO customers (id, name) VALUES (?, ?)', [id, name]);
    const customer = await getQuery('SELECT * FROM customers WHERE id = ?', [id]);
    res.status(201).json(customer);
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// GET /api/scripts - Get all scripts with customers
app.get('/api/scripts', async (req, res) => {
  try {
    const scripts = await allQuery('SELECT * FROM scripts ORDER BY updatedAt DESC');
    
    const scriptsWithCustomers = await Promise.all(
      scripts.map(async (script) => {
        const customers = await allQuery(`
          SELECT c.id, c.name 
          FROM customers c
          JOIN script_customers sc ON c.id = sc.customerId 
          WHERE sc.scriptId = ?
        `, [script.id]);

        return {
          ...script,
          isGlobal: Boolean(script.isGlobal),
          autoEnrollment: Boolean(script.autoEnrollment),
          customers: customers.map(c => c.id),
          createdAt: new Date(script.createdAt),
          updatedAt: new Date(script.updatedAt)
        };
      })
    );

    res.json(scriptsWithCustomers);
  } catch (error) {
    console.error('Error fetching scripts:', error);
    res.status(500).json({ error: 'Failed to fetch scripts' });
  }
});

// GET /api/scripts/:id - Get specific script
app.get('/api/scripts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const script = await getScriptWithCustomers(id);
    
    if (!script) {
      return res.status(404).json({ error: 'Script not found' });
    }

    res.json(script);
  } catch (error) {
    console.error('Error fetching script:', error);
    res.status(500).json({ error: 'Failed to fetch script' });
  }
});

// POST /api/scripts - Create a new script
app.post('/api/scripts', async (req, res) => {
  try {
    const { name, command, description, category, isGlobal, autoEnrollment, customers } = req.body;
    
    if (!name || !command || !category) {
      return res.status(400).json({ error: 'Name, command, and category are required' });
    }

    // Validate category
    const validCategories = ['software', 'sicherheit', 'konfiguration', 'befehl'];
    if (!validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    const scriptId = Date.now().toString();
    
    // Insert script
    await runQuery(`
      INSERT INTO scripts (id, name, command, description, category, isGlobal, autoEnrollment)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [scriptId, name, command, description || '', category, isGlobal ? 1 : 0, autoEnrollment ? 1 : 0]);

    // Insert script-customer relationships
    if (customers && Array.isArray(customers)) {
      for (const customerId of customers) {
        await runQuery(
          'INSERT INTO script_customers (scriptId, customerId) VALUES (?, ?)',
          [scriptId, customerId]
        );
      }
    }

    const newScript = await getScriptWithCustomers(scriptId);
    res.status(201).json(newScript);
  } catch (error) {
    console.error('Error creating script:', error);
    res.status(500).json({ error: 'Failed to create script' });
  }
});

// PUT /api/scripts/:id - Update a script
app.put('/api/scripts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, command, description, category, isGlobal, autoEnrollment, customers } = req.body;

    // Check if script exists
    const existingScript = await getQuery('SELECT * FROM scripts WHERE id = ?', [id]);
    if (!existingScript) {
      return res.status(404).json({ error: 'Script not found' });
    }

    // Validate category
    const validCategories = ['software', 'sicherheit', 'konfiguration', 'befehl'];
    if (category && !validCategories.includes(category)) {
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Update script
    await runQuery(`
      UPDATE scripts 
      SET name = ?, command = ?, description = ?, category = ?, isGlobal = ?, autoEnrollment = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [name, command, description || '', category, isGlobal ? 1 : 0, autoEnrollment ? 1 : 0, id]);

    // Update script-customer relationships
    await runQuery('DELETE FROM script_customers WHERE scriptId = ?', [id]);
    if (customers && Array.isArray(customers)) {
      for (const customerId of customers) {
        await runQuery(
          'INSERT INTO script_customers (scriptId, customerId) VALUES (?, ?)',
          [id, customerId]
        );
      }
    }

    const updatedScript = await getScriptWithCustomers(id);
    res.json(updatedScript);
  } catch (error) {
    console.error('Error updating script:', error);
    res.status(500).json({ error: 'Failed to update script' });
  }
});

// DELETE /api/scripts/:id - Delete a script
app.delete('/api/scripts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if script exists
    const existingScript = await getQuery('SELECT * FROM scripts WHERE id = ?', [id]);
    if (!existingScript) {
      return res.status(404).json({ error: 'Script not found' });
    }

    // Delete script (CASCADE will handle script_customers)
    await runQuery('DELETE FROM scripts WHERE id = ?', [id]);
    
    res.json({ message: 'Script deleted successfully' });
  } catch (error) {
    console.error('Error deleting script:', error);
    res.status(500).json({ error: 'Failed to delete script' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`API endpoints available at http://localhost:${PORT}/api`);
});