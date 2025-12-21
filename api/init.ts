import { sql } from '@vercel/postgres';

export default async function handler(req: any, res: any) {
  try {
    const { reset } = req.query;

    if (reset === 'true' || req.method === 'POST') {
      await sql`DROP TABLE IF EXISTS equipment CASCADE`;
      await sql`DROP TABLE IF EXISTS users CASCADE`;
      await sql`DROP TABLE IF EXISTS audit_logs CASCADE`;
      await sql`DROP TABLE IF EXISTS notifications CASCADE`;
      await sql`DROP TABLE IF EXISTS events CASCADE`;
      await sql`DROP TABLE IF EXISTS settings CASCADE`;
    }

    // Create Tables
    await sql`CREATE TABLE IF NOT EXISTS equipment (
      id TEXT PRIMARY KEY,
      category TEXT,
      brand TEXT,
      model TEXT,
      serial_number TEXT,
      installation_date TEXT,
      status TEXT,
      division TEXT,
      location TEXT,
      calibration_point TEXT,
      pic TEXT,
      image TEXT,
      cal_cert TEXT,
      ver_cert TEXT
    )`;

    await sql`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT,
      email TEXT UNIQUE,
      role TEXT,
      avatar TEXT,
      password TEXT,
      status TEXT DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP
    )`;

    await sql`CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action TEXT,
      target_id TEXT,
      target_name TEXT,
      user_id TEXT,
      user_name TEXT,
      timestamp TEXT,
      details TEXT
    )`;

    await sql`CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      title TEXT,
      message TEXT,
      timestamp TEXT,
      is_read BOOLEAN DEFAULT FALSE,
      type TEXT
    )`;

    await sql`CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      start_date TEXT,
      end_date TEXT,
      type TEXT,
      equipment_id TEXT,
      created_by TEXT
    )`;

    await sql`CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      values JSONB
    )`;

    // Seed Data if Equipment is empty
    const eqCountResult = await sql`SELECT count(*) FROM equipment`;
    const count = parseInt(eqCountResult.rows[0].count);
    
    if (count === 0) {
      // Mock Users
      await sql`INSERT INTO users (id, name, email, role, avatar, password, status) VALUES 
        ('1', 'Administrator', 'admin@sss.com', 'Admin', 'https://picsum.photos/id/64/100/100', 'admin', 'active'),
        ('2', 'Fauzan Rizqy Kanz', 'fauzan.rizqy@siglaboratory.co.id', 'Supporting', 'https://picsum.photos/id/65/100/100', 'supporting', 'active')
        ON CONFLICT (id) DO NOTHING`;

      // Settings
      await sql`INSERT INTO settings (id, values) VALUES ('categories', '["HPLC", "LC-MS", "GC-MS", "Spectrophotometer", "pH Meter", "Centrifuge", "Analytical Balance", "Fume Hood", "Micropipette", "Ultrasonic"]')
                ON CONFLICT (id) DO NOTHING`;
    }

    return res.status(200).json({ data: { success: true, message: 'Database Ready' } });
  } catch (error: any) {
    console.error('INIT ERROR:', error);
    return res.status(500).json({ error: error.message });
  }
}