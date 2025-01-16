import { IsInt, IsNotEmpty, IsString, Length } from "class-validator";

export class AddIntervalDto {
  @Length(21)
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @Length(21)
  @IsString()
  @IsNotEmpty()
  book_id: string;

  @IsInt()
  @IsNotEmpty()
  start_page: number;

  @IsInt()
  @IsNotEmpty()
  end_page: number;
}
