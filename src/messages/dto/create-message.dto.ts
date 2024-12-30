import { IsString, MinLength } from 'class-validator';

export class MessageDto {
  @IsString()
  @MinLength(3)
  message: string;
}
