import { Module } from '@nestjs/common';
import { PositionsService } from './positions.service';
import { PositionsController } from './positions.controller';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [PositionsController],
  providers: [PositionsService, DatabaseService],
})
export class PositionsModule {}
