import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTestDto {
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  message: string;
}
