import { Test, TestingModule } from "@nestjs/testing";
import { BookService } from "./book.service";
import { PrismaService } from "../prisma/prisma.service";
import { AddBookDto, UpdateBookDto, GetBookDto } from "./book.dto";
import { CustomException } from "../common/filter/custom-exception.filter";

describe("BookService", () => {
  let service: BookService;
  let prismaService: PrismaService;

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookService,
        {
          provide: PrismaService,
          useValue: {
            book: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<BookService>(BookService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  describe("addBook", () => {
    it("should create a book successfully", async () => {
      const dto: AddBookDto = {
        title: "Test Book",
        author: "John Doe",
        num_of_pages: 200,
      };

      const mockBook = {
        id: "1",
        title: dto.title,
        author: dto.author,
        numOfPages: dto.num_of_pages,
      };

      jest
        .spyOn(prismaService.book, "create")
        .mockResolvedValueOnce(mockBook as any);

      const result = await service.addBook(dto);

      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: {
          numOfPages: dto.num_of_pages,
          title: dto.title,
          author: dto.author,
        },
      });
      expect(result).toEqual(mockBook);
    });

    it("should throw a CustomException when an error occurs", async () => {
      const dto: AddBookDto = {
        title: "Test Book",
        author: "John Doe",
        num_of_pages: 200,
      };

      jest
        .spyOn(prismaService.book, "create")
        .mockRejectedValueOnce(new Error("Database error"));

      await expect(service.addBook(dto)).rejects.toThrow(CustomException);
      expect(prismaService.book.create).toHaveBeenCalledWith({
        data: {
          numOfPages: dto.num_of_pages,
          title: dto.title,
          author: dto.author,
        },
      });
    });
  });

  describe("updateBook", () => {
    it("should update a book successfully", async () => {
      const dto: UpdateBookDto = {
        book_id: "1",
        title: "Updated Title",
        author: "Updated Author",
        num_of_pages: 250,
      };

      const mockUpdatedBook = {
        id: "1",
        title: dto.title,
        author: dto.author,
        numOfPages: dto.num_of_pages,
      };

      jest
        .spyOn(prismaService.book, "findUnique")
        .mockResolvedValueOnce(mockUpdatedBook as any);
      jest
        .spyOn(prismaService.book, "update")
        .mockResolvedValueOnce(mockUpdatedBook as any);

      const result = await service.updateBook(dto);

      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: dto.book_id },
      });
      expect(prismaService.book.update).toHaveBeenCalledWith({
        where: { id: dto.book_id },
        data: {
          numOfPages: dto.num_of_pages,
          title: dto.title,
          author: dto.author,
        },
      });
      expect(result).toEqual(mockUpdatedBook);
    });

    it("should throw a CustomException when the book is not found", async () => {
      const dto: UpdateBookDto = {
        book_id: "1",
        title: "Updated Title",
        author: "Updated Author",
        num_of_pages: 250,
      };

      jest.spyOn(prismaService.book, "findUnique").mockResolvedValueOnce(null);

      await expect(service.updateBook(dto)).rejects.toThrow(CustomException);
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: dto.book_id },
      });
    });
  });

  describe("getBook", () => {
    it("should return a book successfully", async () => {
      const dto: GetBookDto = { book_id: "1" };

      const mockBook = {
        id: dto.book_id,
        title: "Sample Book",
        author: "Jane Doe",
        numOfPages: 150,
      };

      jest
        .spyOn(prismaService.book, "findUnique")
        .mockResolvedValueOnce(mockBook as any);

      const result = await service.getBook(dto);

      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: dto.book_id },
      });
      expect(result).toEqual(mockBook);
    });

    it("should throw a CustomException when the book is not found", async () => {
      const dto: GetBookDto = { book_id: "1" };

      jest.spyOn(prismaService.book, "findUnique").mockResolvedValueOnce(null);

      await expect(service.getBook(dto)).rejects.toThrow(CustomException);
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: dto.book_id },
      });
    });
  });

  describe("deleteBook", () => {
    it("should delete a book successfully", async () => {
      const dto: GetBookDto = { book_id: "1" };

      jest
        .spyOn(prismaService.book, "findUnique")
        .mockResolvedValueOnce({ id: dto.book_id } as any);
      jest.spyOn(prismaService.book, "delete").mockResolvedValueOnce(null);

      const result = await service.deleteBook(dto);

      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: dto.book_id },
      });
      expect(prismaService.book.delete).toHaveBeenCalledWith({
        where: { id: dto.book_id },
      });
      expect(result).toEqual({ message: "Book deleted" });
    });

    it("should throw a CustomException when the book is not found", async () => {
      const dto: GetBookDto = { book_id: "1" };

      jest.spyOn(prismaService.book, "findUnique").mockResolvedValueOnce(null);

      await expect(service.deleteBook(dto)).rejects.toThrow(CustomException);
      expect(prismaService.book.findUnique).toHaveBeenCalledWith({
        where: { id: dto.book_id },
      });
    });
  });

  describe("allBooks", () => {
    it("should return all books", async () => {
      const mockBooks = [
        { id: "1", title: "Book 1", author: "Author 1", numOfPages: 100 },
        { id: "2", title: "Book 2", author: "Author 2", numOfPages: 200 },
      ];

      jest
        .spyOn(prismaService.book, "findMany")
        .mockResolvedValueOnce(mockBooks as any);

      const result = await service.allBooks();

      expect(prismaService.book.findMany).toHaveBeenCalled();
      expect(result).toEqual({ books: mockBooks });
    });

    it("should return an empty array if no books are found", async () => {
      jest.spyOn(prismaService.book, "findMany").mockResolvedValueOnce([]);

      const result = await service.allBooks();

      expect(prismaService.book.findMany).toHaveBeenCalled();
      expect(result).toEqual({ books: [] });
    });
  });
});
