import { Body, Controller, Get, Post, UseGuards } from "@nestjs/common";
import { IntervalService } from "./interval.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { AddIntervalDto } from "./interval.dto";

@Controller("interval")
export class IntervalController {
  constructor(private readonly intervalService: IntervalService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async addInterval(@Body() dto: AddIntervalDto) {
    return await this.intervalService.addInterval(dto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async recommended() {
    return await this.intervalService.recommended();
  }
}
