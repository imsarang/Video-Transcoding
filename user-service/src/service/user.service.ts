import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Logger } from "nestjs-pino";
import bcrypt from "node_modules/bcryptjs";
import { CreateUserDto } from "src/dto/entity.dto";
import { User } from "src/entity/user.entity";
import { Repository } from "typeorm";
import * as uuid from 'uuid';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private readonly logger: Logger,
    ){}

    async createUser(createUserData: CreateUserDto) {
        try
        {
            const {email, password} = createUserData;

            const existingUser = await this.userRepository.findOneBy({email: email});

            if (existingUser) {
                throw new Error('User with this email already exists');
            }

            const user_uuid = uuid.v4();

            const hashedPassword = await bcrypt.hash(password, 10)

            const newUser = {
                email: email,
                password: hashedPassword,
                uuid: user_uuid,
            }

            await this.userRepository.save(newUser);

            console.log(`New User Created: ${email}, ${user_uuid}`);
            
        }
        catch(err)
        {
            console.error(`Error while creating User`, err);
            throw err;
        }
    }

    async getUserById(id: string) {
        return await this.userRepository.findOne({
            where: {uuid: id},
            select: ['uuid', 'email', 'firstName', 'lastName', 'phoneNumber', 'profileImage', 'role', 'isVerified', 'createdAt', 'updatedAt']
        });
    }

    async getUserByEmail(email: string) {
        return await this.userRepository.findOneBy({email: email});
    }

    async updateUser(updateData: any) {
        const existingUser = await this.userRepository.findOneBy({uuid: updateData.uuid});
        if (!existingUser) {
            throw new Error('User not found');
        }
        await this.userRepository.update({uuid: updateData.uuid}, updateData);
    }
    

    async deleteUser(
        uuid: string
    ) {
        const existingUser = await this.userRepository.findOneBy({uuid: uuid});
        if (!existingUser) {
            throw new Error('User not found');
        }
        await this.userRepository.delete({uuid: uuid});
    }

    async resetPassword() { }

    async forgotPassword() { }

    async getUsers () {
        this.logger.log(`Fetching all users from database.`);
        const users = await this.userRepository.find()
        this.logger.log(`Fetched ${users.length} users from database.`);
        // this.logger.debug(users)
        return users;     
    }
}