import pg from 'pg';

const { Client } = pg;

export class DbHelper {
  constructor() {
    this.client = new Client({
      connectionString: 'postgresql://postgres.tocfpzzbvlviwdybyvzq:QTus%402405200@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres',
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
