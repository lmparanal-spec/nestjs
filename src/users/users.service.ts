import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcryptjs';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

@Injectable()
export class UsersService {
  constructor(private readonly db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // Create user
  async createUser(username: string, password: string, contact_number: string, role: string = 'user') {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await this.pool().query<ResultSetHeader>(
      `INSERT INTO users (username, password, contact_number, role) VALUES (?, ?, ?, ?)`,
      [username, hashedPassword, contact_number, role],
    );
    return { message: 'User created successfully', id: result.insertId };
  }

  // Find user by username (for login)
  async findByUsername(username: string) {
    const [rows] = await this.pool().query<RowDataPacket[]>(
      `SELECT * FROM users WHERE username = ?`,
      [username],
    );
    return rows.length ? rows[0] : null;
  }

  // ✅ Find user by ID (fixes your error)
  async findById(id: number) {
    const [rows] = await this.pool().query<RowDataPacket[]>(
      `SELECT * FROM users WHERE id = ?`,
      [id],
    );
    if (!rows.length) throw new NotFoundException('User not found');
    return rows[0];
  }

  // Get all users
  async findAll() {
    const [rows] = await this.pool().query<RowDataPacket[]>(`SELECT * FROM users`);
    return rows;
  }
}
