import { IsArray, ArrayMaxSize, IsOptional, IsString, MaxLength } from 'class-validator';

export class SyncContactsDto {
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5000)
  @IsString({ each: true })
  @MaxLength(32, { each: true })
  phones?: string[];
}
