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

    @Column({nullable: false, name: 'role', default: UserRole.USER, enum: UserRole})
    role: UserRole

    @Column({nullable: false, name: 'is_verified', default: false})
    isVerified: boolean

    @Column({name: 'firstname'})
    firstName: string | null

    @Column({name: 'lastname'})
    lastName: string | null

    @Column({name: 'phone_number'})
    phoneNumber: string | null

    @Column({name: 'profile_image'})
    profileImage: string | null

    @Column({nullable: false, name: 'created_at', default: Date.now()})
    createdAt: Date

    @Column({nullable: true, name: 'updated_at', default: Date.now()})
    updatedAt: Date | null
}