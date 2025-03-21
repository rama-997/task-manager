import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm'
import { TaskStatus } from '@src/tasks/types'
import { User } from '@src/auth/entities'

@Entity()
export class Task {
    @PrimaryGeneratedColumn('uuid')
    readonly id?: string

    @Column()
    title: string

    @Column()
    description: string

    @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.TODO })
    status: TaskStatus

    @ManyToOne(() => User, user => user.tasks, {
        nullable: false,
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'user_id' })
    user: User

    @CreateDateColumn({ name: 'created_at' })
    readonly createdAt?: Date

    @UpdateDateColumn({ name: 'updated_at' })
    readonly updatedAt?: Date
}
