import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool!: mysql.Pool;

  async onModuleInit() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // Optional: test connection
    const conn = await this.pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ MySQL connection pool created');
  }

  async onModuleDestroy() {
    await this.pool.end();
    console.log('🧹 MySQL pool closed');
  }

  getPool() {
    return this.pool;
  }
}