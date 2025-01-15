import { Injectable } from "@nestjs/common";
import { randomBytes, pbkdf2Sync } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { LoginDto, SignupDto } from "./auth.dto";
import { CustomException } from "../common/filter/custom-exception.filter";
import { PrismaService } from "../prisma/prisma.service";
import { omit } from "ramda";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
  constructor(
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  async signup(dto: SignupDto): Promise<object> {
    const { email, password, name } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) throw new CustomException("User already exists");

    const hashedPassword = this.hashPassword(password);
    const newUser = await this.prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    return {
      access_token: this.signToken({ id: newUser.id, role: newUser.role }),
      user: omit(["password"], newUser),
    };
  }

  async login(dto: LoginDto): Promise<object> {
    const { email, password } = dto;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new CustomException("Invalid email or password");

    if (!this.validatePassword(user.password, password))
      throw new CustomException("Invalid email or password");

    return {
      access_token: await this.signToken({
        id: user.id,
        role: String(user.role),
      }),
      user: omit(["password"], user),
    };
  }

  hashPassword(password: string): string {
    const salt = randomBytes(128).toString("base64");
    const iterations = 10000;
    const keylen = 64;
    const digest = "sha512";
    const hash = pbkdf2Sync(password, salt, iterations, keylen, digest);
    return `${salt}:${iterations}:${hash.toString("hex")}`;
  }

  validatePassword(storedPassword: string, enteredPassword: string): boolean {
    const [salt, iterations, storedHash] = storedPassword.split(":");

    if (!salt || !iterations || !storedHash) {
      throw new CustomException("Invalid stored password format");
    }

    const enteredHash = pbkdf2Sync(
      enteredPassword,
      salt,
      parseInt(iterations, 10),
      64,
      "sha512"
    ).toString("hex");

    return enteredHash === storedHash;
  }

  async signToken(payload: any): Promise<string> {
    const secret = this.config.get("JWT_SECRET");

    return this.jwt.signAsync(payload, { secret });
  }
}
