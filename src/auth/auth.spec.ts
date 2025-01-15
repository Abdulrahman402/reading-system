import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { PrismaService } from "../prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { CustomException } from "../common/filter/custom-exception.filter";
import { SignupDto, LoginDto } from "./auth.dto";
import { pbkdf2Sync } from "crypto";
import { ConfigModule } from "@nestjs/config";

describe("AuthService", () => {
  let authService: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockJwtService = {
    signAsync: jest.fn().mockReturnValue("mocked-jwt-token"),
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("signup", () => {
    it("should throw error if user already exists", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        email: "test@test.com",
      });

      const dto: SignupDto = {
        email: "test@test.com",
        password: "password",
        name: "Test User",
      };

      await expect(authService.signup(dto)).rejects.toThrow(CustomException);
    });

    it("should return access token and user data on successful signup", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);
      mockPrismaService.user.create.mockResolvedValueOnce({
        id: 1,
        email: "test@test.com",
        password: "hashed-password",
        name: "Test User",
        role: "user",
      });

      const dto: SignupDto = {
        email: "test@test.com",
        password: "password",
        name: "Test User",
      };

      const result = await authService.signup(dto);

      expect(result).toHaveProperty("access_token");
      expect(result["access_token"]).toBe("mocked-jwt-token");
      expect(result).toHaveProperty("user");
      expect(result["user"]).not.toHaveProperty("password");
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should throw error if user is not found", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const dto: LoginDto = {
        email: "nonexistent@test.com",
        password: "password",
      };

      await expect(authService.login(dto)).rejects.toThrow(CustomException);
    });

    it("should throw error if password is invalid", async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce({
        id: 1,
        email: "test@test.com",
        password: "hashed-password",
        name: "Test User",
        role: "user",
      });

      const dto: LoginDto = {
        email: "test@test.com",
        password: "wrongpassword",
      };

      await expect(authService.login(dto)).rejects.toThrow(CustomException);
    });

    it("should return access token and user data on successful login", async () => {
      const mockUser = {
        id: 1,
        email: "test@test.com",
        password: "salt:10000:hashed-password",
        name: "Test User",
        role: "user",
      };

      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      jest.spyOn(authService, "validatePassword").mockReturnValueOnce(true);

      const dto: LoginDto = { email: "test@test.com", password: "password" };

      const result = await authService.login(dto);

      expect(result).toHaveProperty("access_token");
      expect(result["access_token"]).toBe("mocked-jwt-token");
      expect(result).toHaveProperty("user");
      expect(result["user"]).not.toHaveProperty("password");
    });
  });

  describe("hashPassword", () => {
    it("should return a hashed password", () => {
      const password = "password";
      const hashedPassword = authService.hashPassword(password);

      expect(hashedPassword).toContain(":");
      expect(hashedPassword.split(":")).toHaveLength(3);
    });
  });

  describe("validatePassword", () => {
    it("should return true for a valid password", () => {
      const salt = "random_salt";
      const iterations = 10000;
      const enteredPassword = "password123";
      const storedHash = pbkdf2Sync(
        enteredPassword,
        salt,
        iterations,
        64,
        "sha512"
      ).toString("hex");
      const storedPassword = `${salt}:${iterations}:${storedHash}`;

      expect(
        authService.validatePassword(storedPassword, enteredPassword)
      ).toBe(true);
    });

    it("should return false if password is invalid", () => {
      const storedPassword = "salt:10000:hashed-password";
      const enteredPassword = "wrongpassword";

      const result = authService.validatePassword(
        storedPassword,
        enteredPassword
      );

      expect(result).toBe(false);
    });

    it("should throw an error if stored password format is invalid", () => {
      const storedPassword = "invalid-format-password";

      expect(() =>
        authService.validatePassword(storedPassword, "password")
      ).toThrow(CustomException);
    });
  });
});
