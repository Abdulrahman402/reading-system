import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddBookDto, UpdateBookDto, GetBookDto } from "./book.dto";
import { CustomException } from "../common/filter/custom-exception.filter";

@Injectable()
export class BookService {
  constructor(private readonly prisma: PrismaService) {}

  async addBook(dto: AddBookDto) {
    const { title, author, num_of_pages } = dto;

    try {
      const book = await this.prisma.book.create({
        data: { numOfPages: num_of_pages, title, author },
      });

      return book;
    } catch (e) {
      console.error(e);
      throw new CustomException("Failed to add book to database");
    }
  }

  async updateBook(dto: UpdateBookDto) {
    const { title, author, num_of_pages, book_id } = dto;

    try {
      const existingBook = await this.prisma.book.findUnique({
        where: { id: book_id },
      });

      if (!existingBook) throw new CustomException("Book Not found", 404);

      const book = await this.prisma.book.update({
        where: { id: book_id },
        data: { numOfPages: num_of_pages, title, author },
      });

      return book;
    } catch (e) {
      console.error(e);
      if (e instanceof CustomException) throw e;

      throw new CustomException("Failed to update book into database");
    }
  }

  async getBook(dto: GetBookDto) {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id: dto.book_id },
      });

      if (!book) throw new CustomException("Book Not found", 404);

      return book;
    } catch (e) {
      console.error(e);

      if (e instanceof CustomException) throw e;

      throw new CustomException("Failed to get book from database");
    }
  }

  async deleteBook(dto: GetBookDto) {
    try {
      const book = await this.prisma.book.findUnique({
        where: { id: dto.book_id },
      });

      if (!book) throw new CustomException("Book Not found", 404);

      await this.prisma.book.delete({ where: { id: dto.book_id } });

      return { message: "Book deleted" };
    } catch (e) {
      console.error(e);

      if (e instanceof CustomException) throw e;

      throw new CustomException("Failed to delete book from database");
    }
  }

  async allBooks() {
    try {
      const books = await this.prisma.book.findMany();

      return { books: books || [] };
    } catch (e) {
      console.error(e);

      throw new CustomException("Failed to get books from database");
    }
  }
}
