import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AddIntervalDto } from "./interval.dto";
import { CustomException } from "../common/filter/custom-exception.filter";

@Injectable()
export class IntervalService {
  constructor(private readonly prisma: PrismaService) {}

  async addInterval(dto: AddIntervalDto) {
    const { user_id, book_id, start_page, end_page } = dto;

    const storedPages = await this.prisma.readingInterval.aggregate({
      where: { bookId: book_id },
      _min: { startPage: true },
      _max: { endPage: true },
    });

    const lowestStoredPage = storedPages._min.startPage ?? start_page;
    const highestStoredPage = storedPages._max.endPage ?? end_page;

    const expandsDistinctPages =
      start_page < lowestStoredPage || end_page > highestStoredPage;

    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.readingInterval.create({
          data: {
            userId: user_id,
            bookId: book_id,
            startPage: start_page,
            endPage: end_page,
          },
        });

        if (expandsDistinctPages) {
          const lowest = Math.min(start_page, lowestStoredPage);
          const highest = Math.max(end_page, highestStoredPage);

          await tx.book.update({
            where: { id: book_id },
            data: { numOfReadingPages: highest - lowest + 1 },
          });
        }
      });

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
