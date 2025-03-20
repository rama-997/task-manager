import {
    Column,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
} from 'typeorm'
import { User } from '@src/auth/entities'

@Entity()
export class Token {
    @PrimaryGeneratedColumn('uuid')
    readonly id: string

    @Column({ name: 'refresh_token' })
    refreshToken: string

    @Column({ name: 'user_agent', nullable: true })
    userAgent?: string

    @ManyToMany(() => User, user => user.tokens)
    @JoinTable({
        name: 'token_users',
        joinColumn: { name: 'token_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' },
    })
    readonly users?: User[]
}
