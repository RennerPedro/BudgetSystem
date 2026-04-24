import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class SetApiKeyDto {
  @ApiProperty({ example: 'sk-...' })
  @IsString()
  @MinLength(20)
  apiKey!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  autoEnable?: boolean;
}

export class DeepSeekKeyStatusDto {
  @ApiProperty()
  configured!: boolean;

  @ApiProperty()
  enabled!: boolean;
}
