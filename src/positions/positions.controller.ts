import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { PositionsService } from './positions.service';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  async findAll() {
    return this.positionsService.findAll();
  }

  @Post()
  async create(
    @Body('position_code') position_code: string,
    @Body('position_name') position_name: string,
    @Body('id') id: number,
  ) {
    return this.positionsService.create(position_code, position_name, id);
  }

  @Put(':position_id')
  async update(
    @Param('position_id') position_id: number,
    @Body('position_name') position_name: string,
  ) {
    return this.positionsService.update(position_id, position_name);
  }

  @Delete(':position_id')
  async remove(@Param('position_id') position_id: number) {
    return this.positionsService.remove(position_id);
  }
}
