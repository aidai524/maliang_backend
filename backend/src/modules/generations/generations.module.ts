import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Generation } from './entities/generation.entity';
import { GenerationsService } from './generations.service';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Generation, User])],
  providers: [GenerationsService],
  exports: [GenerationsService],
})
export class GenerationsModule {}
