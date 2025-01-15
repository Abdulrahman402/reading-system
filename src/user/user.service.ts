import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AssignRoleDto } from "./user.dto";
import { CustomException } from "../common/filter/custom-exception.filter";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async assignRole(dto: AssignRoleDto) {
    const { user_id, role } = dto;

    try {
      await this.prisma.user.update({
        where: { id: user_id },
        data: { role },
      });

      return { status_code: "success" };
    } catch (e) {
      console.error(e);
      throw new CustomException("Failed to update user in database");
    }
  }
}
