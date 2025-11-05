import { Module } from '@nestjs/common';
import { ClinicService } from './services/clinic.service';
import { ClinicController } from './controllers/clinic.controller';
import { PrismaService } from '../../prisma/prisma.service';

@Module({
  controllers: [ClinicController],
  providers: [ClinicService, PrismaService],
  exports: [ClinicService],
})
export class ClinicModule {}
