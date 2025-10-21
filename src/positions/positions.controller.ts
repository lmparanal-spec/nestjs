import { Controller, Get, Post, Put, Delete, Param, Body, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { PositionsService } from './positions.service';

@Controller('positions')
export class PositionsController {
  constructor(private readonly positionsService: PositionsService) {}

  @Get()
  findAll() {
    return this.positionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.findOne(id);
  }

  @Post()
  create(@Body() body: { position_code?: string; position_name?: string }) {
    if (!body.position_code) throw new BadRequestException('position_code is required');
    if (!body.position_name) throw new BadRequestException('position_name is required');
   

    return this.positionsService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { position_code?: string; position_name?: string; id?: number },
  ) {
    return this.positionsService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.positionsService.remove(id);
  }

  @Delete()
  removeAll() {
    return this.positionsService.removeAll();
  }
}
