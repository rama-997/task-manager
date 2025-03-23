import { ERoles } from '@src/role/types'
import { IsEnum, IsOptional } from 'class-validator'

export class CreateRoleDto {
    @IsEnum(ERoles, {
        message: `Роль может быть только одним их этих значений: ${Object.values(ERoles)}`,
    })
    value: ERoles

    @IsOptional()
    description?: string
}