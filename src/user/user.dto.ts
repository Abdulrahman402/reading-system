import { Role } from "@prisma/client";
import { IsEnum, IsNotEmpty, IsString } from "class-validator";

export class AssignRoleDto {
  @IsNotEmpty()
  @IsString()
  @IsEnum(Role)
  role: Role;

  @IsString()
  @IsNotEmpty()
  user_id: string;
}
