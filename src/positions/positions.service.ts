import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

@Injectable()
export class PositionsService {
  constructor(private readonly db: DatabaseService) {}

  private pool = () => this.db.getPool();

  // Get all positions
  async findAll() {
    const [rows] = await this.pool().query<RowDataPacket[]>(
      `SELECT p.position_id, p.position_code, p.position_name, u.username AS user_name
       FROM positions p
       JOIN users u ON p.id = u.id`
    );
    return rows;
  }

  // Create position
  async create(position_code: string, position_name: string, id: number) {
    const [result] = await this.pool().query<ResultSetHeader>(
      `INSERT INTO positions (position_code, position_name, id) VALUES (?, ?, ?)`,
      [position_code, position_name, id],
    );
    return { message: 'Position created successfully', position_id: result.insertId };
  }

  // Update position
  async update(position_id: number, position_name: string) {
    const [result] = await this.pool().query<ResultSetHeader>(
      `UPDATE positions SET position_name = ? WHERE position_id = ?`,
      [position_name, position_id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Position not found');
    }

    return { message: 'Position updated successfully' };
  }

  // Delete position
  async remove(position_id: number) {
    const [result] = await this.pool().query<ResultSetHeader>(
      `DELETE FROM positions WHERE position_id = ?`,
      [position_id],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Position not found');
    }

    return { message: 'Position deleted successfully' };
  }
}
