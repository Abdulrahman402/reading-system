import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { AddBookDto, GetBookDto, UpdateBookDto } from "./book.dto";
import { BookService } from "./book.service";
import { JwtAuthGuard } from "src/common/guard/jwt-auth.guard";
import { RolesGuard } from "src/common/guard/roles.guard";
import { Role } from "@prisma/client";
import { Roles } from "src/common/decorators/roles.decorator";

@Controller("book")
export class BookController {
  constructor(private readonly bookService: BookService) {}
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async addBook(@Body() dto: AddBookDto) {
    return await this.bookService.addBook(dto);
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async updateBook(@Body() dto: UpdateBookDto) {
    const book = await this.bookService.updateBook(dto);

    console.log("Here");
    console.log(book);
    return book;
  }

  @Get("all")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async allBooks() {
    return await this.bookService.allBooks();
  }

  @Get("/:book_id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  async getBook(@Param() dto: GetBookDto) {
    return await this.bookService.getBook(dto);
  }

  @Delete("/:book_id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async deleteBook(@Param() dto: GetBookDto) {
    return await this.bookService.deleteBook(dto);
  }
}
