import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>("roles", [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    if (typeof user.role === "string") {
      console.log("User role is a string:", user.role);
      return requiredRoles.includes(user.role);
    } else if (Array.isArray(user.role)) {
      console.log("User role is an array:", user.role);
      return user.role.some((role) => requiredRoles.includes(role));
    }

    return false;
  }
}
