import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entity/role.entity';
import { User } from './entity/user.entity';
import { UserRoles } from 'src/common/user-roles.enum';
import * as bcrypt from 'bcrypt'
import { RegisterUserDto } from './dto/register-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>
    ) { }


    // fetch all users (without admins)
    async fetchAllUsers(): Promise<UserDto[]> {
        try {
            const users = this.userRepository.find({
                where: {
                    role: {
                        id: UserRoles.USER
                    }
                },
                relations: ['role'],
                select: ['id', 'name', 'email'] // Don't include password
            });

            return (await users).map(user => new UserDto(user))
        } catch (error) {
            throw new InternalServerErrorException(
                `Failed to fetch users: ${error.message}`
            );
        }
    }

    // TODO: create DTO
    async registerUser(registerUserDto: RegisterUserDto): Promise<UserDto> {
        try {
            const { name, email, password } = registerUserDto;
            const roleType = UserRoles.USER;

            // Validate input
            if (!name || !email || !password) {
                throw new BadRequestException('Name, email, and password are required');
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new BadRequestException('Invalid email format');
            }

            // Password strenght - not needed, but kept as a reminder
            /*if (password.length < 8) {
                throw new BadRequestException('Password must be at least 8 characters long');
            }*/

            // Check if user already exists
            const existingUser = await this.userRepository.findOne({
                where: { email: email.toLowerCase() }
            });

            if (existingUser) {
                throw new ConflictException(`User with email ${email} already exists`);
            }

            // Check if the role exists
            const role = await this.roleRepository.findOne({
                where: { id: roleType }
            });

            if (!role) {
                throw new NotFoundException(`Role "${roleType}" not found`);
            }

            // Hash password
            const saltRounds = 12;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            // Create user
            const user = this.userRepository.create({
                name: name.trim(),
                email: email.toLowerCase().trim(),
                password: hashedPassword,
                role,
            });

            const savedUser = await this.userRepository.save(user);

            // Return user without password
            return new UserDto(savedUser)
        } catch (error) {
            if (
                error instanceof ConflictException ||
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            // Handle database errors
            if (error.code === '23505') { // Unique constraint violation
                throw new ConflictException('User with this email already exists');
            }

            throw new InternalServerErrorException(
                `Failed to register user: ${error.message}`
            );
        }
    }

    // used by authentication service
    async findByEmail(email: string): Promise<UserDto> {
        try {
            if (!email) {
                throw new BadRequestException('Email is required');
            }

            const user = await this.userRepository.findOne({
                where: { email: email.toLowerCase().trim() },
                relations: ['role']
            });

            if (!user) {
                throw new NotFoundException(`User with email ${email} not found`);
            }

            return new UserDto(user);
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                `Failed to find user by email: ${error.message}`
            );
        }
    }

    async findById(id: number): Promise<UserDto> {
        try {
            if (!id || id <= 0) {
                throw new BadRequestException('Valid user ID is required');
            }

            const user = await this.userRepository.findOne({
                where: { id },
                relations: ['role', 'events']
            });

            if (!user) {
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            return new UserDto(user);
        } catch (error) {
            if (
                error instanceof BadRequestException ||
                error instanceof NotFoundException
            ) {
                throw error;
            }

            throw new InternalServerErrorException(
                `Failed to find user by ID: ${error.message}`
            );
        }
    }
}
