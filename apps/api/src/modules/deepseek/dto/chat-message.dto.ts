import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ChatMessageDto {
  @ApiProperty({ example: 'Can I afford a 500 expense next week?' })
  @IsString()
  @MinLength(2)
  @MaxLength(500)
  message!: string;
}

export class ChatMessageResponseDto {
  @ApiProperty()
  response!: string;
}
