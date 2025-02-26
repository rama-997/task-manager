import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity()
export class User{
    @PrimaryGeneratedColumn('uuid')
    readonly id: string

    @Column({unique:true,nullable:true})
    login:string

    @Column({unique:true})
    email:string

    @Column()
    password: string

    @Column()
    name:string

    @Column({nullable:true})
    photo:string
}