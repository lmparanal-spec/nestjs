import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { OkPacket, RowDataPacket } from 'mysql2/promise';

@Injectable()
export class PositionsService {
  constructor(private db: DatabaseService) {}

  // Get all positions
  async findAll() {
    const [rows] = await this.db.pool.query<RowDataPacket[]>(
      `SELECT p.position_id, p.position_code, p.position_name, p.id, u.username
       FROM positions p
       JOIN users u ON p.id = u.id`
    );
    return { message: 'Positions retrieved successfully', data: rows };
  }

  // Get one position
  async findOne(position_id: number) {
    const [rows] = await this.db.pool.query<RowDataPacket[]>(
      `SELECT p.position_id, p.position_code, p.position_name, p.id, u.username
       FROM positions p
       JOIN users u ON p.id = u.id
       WHERE p.position_id = ?`,
      [position_id]
    );
    if (!rows.length) throw new NotFoundException(`Position with id ${position_id} not found`);
    return { data: rows[0] };
  }

  // Create a new position
  async create(data: { position_code?: string; position_name?: string; id?: number }) {
    if (!data.position_code) throw new BadRequestException('position_code is required');
    if (!data.position_name) throw new BadRequestException('position_name is required');
    if (!data.id) throw new BadRequestException('User id is required');

    const [userRows] = await this.db.pool.query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [data.id]);
    if (!userRows.length) throw new NotFoundException(`User with id ${data.id} not found`);

    const [result] = await this.db.pool.query<OkPacket>(
      `INSERT INTO positions (position_code, position_name, id) VALUES (?, ?, ?)`,
      [data.position_code, data.position_name, data.id]
    );

    return  { position_id: result.insertId, ...data };
  }

  // Update a position
  async update(position_id: number, data: { position_code?: string; position_name?: string; id?: number }) {
    const existing = await this.findOne(position_id);

    const newCode = data.position_code ?? existing.data.position_code;
    const newName = data.position_name ?? existing.data.position_name;
    const newId = data.id ?? existing.data.id;

    if (data.id) {
      const [userRows] = await this.db.pool.query<RowDataPacket[]>(`SELECT * FROM users WHERE id = ?`, [data.id]);
      if (!userRows.length) throw new NotFoundException(`User with id ${data.id} not found`);
    }

    await this.db.pool.query<OkPacket>(
      `UPDATE positions SET position_code = ?, position_name = ?, id = ? WHERE position_id = ?`,
      [newCode, newName, newId, position_id]
    );

    return { message: 'Position updated successfully' };
  }

  // Delete one position
  async remove(position_id: number) {
    const [result] = await this.db.pool.query<OkPacket>(
      `DELETE FROM positions WHERE position_id = ?`,
      [position_id]
    );
    if (result.affectedRows === 0) throw new NotFoundException(`Position with id ${position_id} not found`);
    return { message: `Position ${position_id} deleted successfully` };
  }

  // Delete all positions
  async removeAll() {
    await this.db.pool.query(`DELETE FROM positions`);
    return { message: ' positions deleted successfully' };
  }
}
