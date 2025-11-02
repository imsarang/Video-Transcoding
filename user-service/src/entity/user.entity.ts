import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({nullable: false, name: 'uuid', unique: true})
    uuid: string

    @Column({nullable: false, name: 'email', unique: true})
    email: string

    @Column({nullable: false, name: 'password'})
    password: string

    @Column({ type: 'enum', enum: UserRole, nullable: false, name: 'role', default: UserRole.USER })
    role: UserRole

    @Column({ type: 'boolean', nullable: false, name: 'is_verified', default: false })
    isVerified: boolean

    @Column({ type: 'varchar', name: 'firstname', nullable: true })
    firstName: string

    @Column({ type: 'varchar', name: 'lastname', nullable: true })
    lastName: string

    @Column({ type: 'varchar', name: 'phone_number', nullable: true })
    phoneNumber: string

    @Column({ type: 'varchar', name: 'profile_image', nullable: true })
    profileImage: string

    @Column({ type: 'timestamp', nullable: false, name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date

    @Column({ type: 'timestamp', nullable: true, name: 'updated_at', default: null })
    updatedAt: Date
}