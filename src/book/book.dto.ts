import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from "class-validator";

export class AddBookDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  author: string;

  @IsNotEmpty()
  @IsInt()
  num_of_pages: number;
}

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  author: string;

  @IsOptional()
  @IsNotEmpty()
  @IsInt()
  num_of_pages: number;

  @IsNotEmpty()
  @IsString()
  book_id: string;
}

export class GetBookDto {
  @IsNotEmpty()
  @IsString()
  @Length(21)
  book_id: string;
}
