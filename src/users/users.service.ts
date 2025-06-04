import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entity/role.entity';
import { User } from './entity/user.entity';

@Injectable()
export class UsersService {
     constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>
      ) {}
    
      // TODO: create DTO
      async registerUser(createUserDto: any): Promise<User> {
        const bcrypt = require('bcrypt')
        const {name, email, password} = createUserDto;
        // check if the user already exists
        const existingUser = await this.userRepository.findOne({where: {email}});
        if (existingUser) {
          throw new ConflictException("User with that email already exists.")
        }
    
        // TODO create enum for role types 
        // create the user
        const role = await this.roleRepository.findOne({where: {name: 'user'}});
        if(!role) {
          throw new Error('Role "user" not found');
        }
    
        const salt = await bcrypt.genSalt();
        const hashedPw = await bcrypt.hash(password, salt);
        const user = this.userRepository.create({
          name,
          email,
          password: hashedPw,
          role,
        });

        return await this.userRepository.save(user)
      }
    
      async getUserByEmail(email: string): Promise<User> {
        const user =  await this.userRepository.findOne({where: {email}})
        if(!user) {
            throw new NotFoundException("Nope")
        }
        return user;
      }

    getUserByEmailAndPassword(email: string, password: string): any {
        throw new Error('Method not implemented.');
    }

}
