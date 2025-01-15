import { Body, Controller, Patch, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { AssignRoleDto } from "./user.dto";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { RolesGuard } from "src/common/guard/roles.guard";
import { Roles } from "src/common/decorators/roles.decorator";
import { Role } from "@prisma/client";

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch("assign-role")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async assignRole(@Body() dto: AssignRoleDto) {
    return this.userService.assignRole(dto);
  }
}
