import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddIntervalDto } from "./interval.dto";
import { CustomException } from "../common/filter/custom-exception.filter";

@Injectable()
export class IntervalService {
  constructor(private readonly prisma: PrismaService) {}

  async addInterval(dto: AddIntervalDto) {
    try {
      const { user_id, book_id, start_page, end_page } = dto;
      await this.prisma.$transaction([
        this.prisma.readingInterval.create({
          data: {
            userId: user_id,
            bookId: book_id,
            startPage: start_page,
            endPage: end_page,
          },
        }),

        this.prisma.$executeRaw`
          UPDATE "Book"
          SET "numOfReadingPages" = (
          SELECT COUNT(DISTINCT page)
          FROM (
          SELECT generate_series("startPage", "endPage") AS page
          FROM "ReadingInterval"
          WHERE "bookId" = ${book_id}
        ) AS unique_pages
      )
          WHERE "id" = ${book_id};`,
      ]);

      return { status_code: "success" };
    } catch (e) {
      console.error(e);

      throw new CustomException("Failed to add interval to database");
    }
  }

  async recommended() {
    try {
      const books = await this.prisma.book.findMany({
        select: {
          id: true,
          title: true,
          numOfPages: true,
          numOfReadingPages: true,
        },
        orderBy: { numOfReadingPages: "desc" },
        take: 5,
      });

      const mappedBooks = books.map((book) => {
        return {
          id: book.id,
          title: book.title,
          num_of_pages: book.numOfPages,
          num_of_reading_pages: book.numOfReadingPages,
        };
      });

      return { books: mappedBooks || [] };
    } catch (e) {
      console.error(e);

      throw new CustomException(
        "Failed to get recommended books from database"
      );
    }
  }
}
