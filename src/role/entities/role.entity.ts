import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm'
import { ERoles } from '@src/role/types'
import { User } from '@src/user/entities'

@Entity()
export class Role{
    @PrimaryGeneratedColumn('uuid')
    readonly id: string

    @Column({type:'enum',enum:ERoles,unique:true})
    value:ERoles

    @Column({nullable:true})
    description?:string

    @ManyToMany(()=>User,user=>user.roles)
    users:User[]
}