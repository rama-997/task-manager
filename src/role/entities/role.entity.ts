import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'
import { ERoles } from '@src/role/types'

@Entity()
export class Role{
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column({type:'enum',enum:ERoles,unique:true})
    value:ERoles

    @Column({nullable:true})
    description:string
}