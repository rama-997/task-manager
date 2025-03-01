import { BadRequestException, ParseUUIDPipeOptions } from '@nestjs/common'

export const parseUUIDConfig:ParseUUIDPipeOptions={
    exceptionFactory:()=>new BadRequestException('Некорректное id')
}