import { Module } from "@nestjs/common";
import { IntervalService } from "./interval.service";
import { IntervalController } from "./interval.controller";

@Module({
  imports: [],
  providers: [IntervalService],
  controllers: [IntervalController],
})
export class IntervalModule {}
