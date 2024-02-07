// import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

export class TwoFAdto {
    // @ApiProperty()
    @IsString()
    code: string
}