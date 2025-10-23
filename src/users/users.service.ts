import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, OkPacket } from 'mysql2';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // ✅ Create user
  async createUser(
    username: string,
    password: string,
    contact_number: string,
    role = 'user',
  ) {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await this.pool().execute<OkPacket>(
      // ✅ Fixed: 4 placeholders instead of 3
      'INSERT INTO users (username, password, contact_number, role) VALUES (?, ?, ?, ?)',
      [username, hashed, contact_number, role],
    );

    return {
      message: 'User created successfully',
      id: result.insertId,
      username,
      contact_number,
      role,
    };
  }

  // ✅ Find by username
  async findByUsername(username: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, password, role, refresh_token FROM users WHERE username = ?',
      [username],
    );

    return rows.length ? rows[0] : null;
  }

  // ✅ Find by ID
  async findById(id: number) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, contact_number, role, created_at FROM users WHERE id = ?',
      [id],
    );

    if (!rows.length) throw new NotFoundException('User not found');
    return rows[0];
  }

  // ✅ Get all users
  async getAll() {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, contact_number, role, created_at FROM users',
    );
    return rows;
  }

  // ✅ Update user
  async updateUser(
    id: number,
    partial: { username?: string; password?: string; contact_number?: string; role?: string },
  ) {
    const fields: string[] = [];
    const values: any[] = [];

    if (partial.username) {
      fields.push('username = ?');
      values.push(partial.username);
    }

    if (partial.password) {
      const hashed = await bcrypt.hash(partial.password, 10);
      fields.push('password = ?');
      values.push(hashed);
    }

    if (partial.contact_number) {
      fields.push('contact_number = ?');
      values.push(partial.contact_number);
    }

    if (partial.role) {
      fields.push('role = ?');
      values.push(partial.role);
    }

    if (fields.length === 0) {
      return await this.findById(id);
    }

    // ✅ Fixed missing template literal quotes
    const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    const [res] = await this.pool().execute<OkPacket>(sql, values);
    if (res.affectedRows === 0) throw new NotFoundException('User not found');

    return this.findById(id);
  }

  // ✅ Delete user
  async deleteUser(id: number) {
    const [res] = await this.pool().execute<OkPacket>(
      'DELETE FROM users WHERE id = ?',
      [id],
    );
    if (res.affectedRows === 0) throw new NotFoundException('User not found');
    return { message: 'User deleted successfully' };
  }

  // ✅ Set refresh token
  async setRefreshToken(id: number, refreshToken: string | null) {
    await this.pool().execute(
      'UPDATE users SET refresh_token = ? WHERE id = ?',
      [refreshToken, id],
    );
  }

  // ✅ Find by refresh token
  async findByRefreshToken(refreshToken: string) {
    const [rows] = await this.pool().execute<RowDataPacket[]>(
      'SELECT id, username, role FROM users WHERE refresh_token = ?',
      [refreshToken],
    );
    return rows.length ? rows[0] : null;
  }
}
