const Database = require('better-sqlite3');
const path = require('path');

// Database path
const dbPath = path.join(__dirname, 'applications.db');
let db;

// Initialize database connection
function initializeDatabase() {
  try {
    // Create database connection
    db = new Database(dbPath);

    // Create applications table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT DEFAULT 'Applied',
        source TEXT,
        resume_version TEXT,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized and applications table created');
    return db;
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Get all applications from database
function getAllApplications() {
  try {
    if (!db) initializeDatabase();

    // Query all applications ordered by applied_at date (newest first)
    const stmt = db.prepare('SELECT * FROM applications ORDER BY applied_at DESC');
    const applications = stmt.all();
    return applications;
  } catch (error) {
    console.error('Error fetching applications:', error);
    throw error;
  }
}

// Get single application by ID
function getApplicationById(id) {
  try {
    if (!db) initializeDatabase();

    // Query application by ID
    const stmt = db.prepare('SELECT * FROM applications WHERE id = ?');
    const application = stmt.get(id);
    return application;
  } catch (error) {
    console.error('Error fetching application by ID:', error);
    throw error;
  }
}

// Create new application
function createApplication(applicationData) {
  try {
    if (!db) initializeDatabase();

    // Insert new application
    const stmt = db.prepare(`
      INSERT INTO applications
        (company, role, status, source, resume_version, applied_at)
      VALUES
        (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      applicationData.company,
      applicationData.role || applicationData.position, // Support both role and position
      applicationData.status || 'Applied',
      applicationData.source || 'Direct',
      applicationData.resume_version || '1.0',
      applicationData.applied_at || new Date().toISOString()
    );

    // Return the newly created application with its ID
    return getApplicationById(result.lastInsertRowid);
  } catch (error) {
    console.error('Error creating application:', error);
    throw error;
  }
}

// Update application status
function updateApplicationStatus(id, newStatus) {
  try {
    if (!db) initializeDatabase();

    // Update only the status field
    const stmt = db.prepare(`
      UPDATE applications
      SET status = ?
      WHERE id = ?
    `);

    const result = stmt.run(newStatus, id);

    if (result.changes === 0) {
      return null; // No application found with that ID
    }

    // Return the updated application
    return getApplicationById(id);
  } catch (error) {
    console.error('Error updating application status:', error);
    throw error;
  }
}

// Update entire application
function updateApplication(id, applicationData) {
  try {
    if (!db) initializeDatabase();

    // Update all fields of the application
    const stmt = db.prepare(`
      UPDATE applications
      SET
        company = ?,
        role = ?,
        status = ?,
        source = ?,
        resume_version = ?,
        applied_at = ?
      WHERE id = ?
    `);

    const result = stmt.run(
      applicationData.company,
      applicationData.role || applicationData.position,
      applicationData.status,
      applicationData.source,
      applicationData.resume_version,
      applicationData.applied_at,
      id
    );

    if (result.changes === 0) {
      return null; // No application found with that ID
    }

    // Return the updated application
    return getApplicationById(id);
  } catch (error) {
    console.error('Error updating application:', error);
    throw error;
  }
}

// Delete application
function deleteApplication(id) {
  try {
    if (!db) initializeDatabase();

    // Delete application by ID
    const stmt = db.prepare('DELETE FROM applications WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0; // Return true if deleted, false if not found
  } catch (error) {
    console.error('Error deleting application:', error);
    throw error;
  }
}

// Close database connection
function closeDatabase() {
  if (db) {
    db.close();
    console.log('Database connection closed');
  }
}

module.exports = {
  initializeDatabase,
  getAllApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  closeDatabase
};