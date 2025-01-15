import { Test, TestingModule } from "@nestjs/testing";
import { UserService } from "./user.service";
import { PrismaService } from "../prisma/prisma.service";
import { AssignRoleDto } from "./user.dto";
import { CustomException } from "../common/filter/custom-exception.filter";
import { Role } from "@prisma/client";

describe("UserService", () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe("assignRole", () => {
    it("should assign a role successfully", async () => {
      const dto: AssignRoleDto = { user_id: "123", role: Role.ADMIN };
      jest.spyOn(prismaService.user, "update").mockResolvedValueOnce(null);

      const result = await service.assignRole(dto);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: dto.user_id },
        data: { role: dto.role },
      });
      expect(result).toEqual({ status_code: "success" });
    });

    it("should throw a CustomException when an error occurs", async () => {
      const dto: AssignRoleDto = { user_id: "123", role: Role.ADMIN };
      jest
        .spyOn(prismaService.user, "update")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(service.assignRole(dto)).rejects.toThrow(CustomException);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: dto.user_id },
        data: { role: dto.role },
      });
    });
  });
});
