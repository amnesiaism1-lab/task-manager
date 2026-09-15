import pg from 'pg';

const { Client } = pg;

export class DbHelper {
  constructor() {
    const connStr = process.env.DATABASE_URL;
    if (!connStr) {
      throw new Error('DATABASE_URL environment variable is required');
    }
    this.client = new Client({
      connectionString: connStr,
      ssl: { rejectUnauthorized: false }
    });
  }

  async connect() {
    await this.client.connect();
  }

  async query(text, params = []) {
    return this.client.query(text, params);
  }

  async queryOne(text, params = []) {
    const res = await this.client.query(text, params);
    return res.rows[0] || null;
  }

  async close() {
    await this.client.end();
  }
}
