import { ApiProperty } from "@nestjs/swagger";

export class fortyTwoProfileDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  login: string;

  @ApiProperty()
  image_url: string;

  @ApiProperty()
  enable2fa: boolean;
}
