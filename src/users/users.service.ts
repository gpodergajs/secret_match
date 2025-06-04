import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';

@Injectable()
export class UsersService {
     constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Role)
        private readonly roleRepository: Repository<Role>
      ) {}
    
      // TODO: create DTO
      async register_user(createUserDto: any): Promise<User> {
        const bcrypt = require('bcrypt')
        const {name, email, password} = createUserDto;
        // check if the user already exists
        const existingUser = await this.userRepository.findOne({where: {email}});
        if (existingUser) {
          throw new ConflictException("User with that email already exists. Thou shall not pass")
        }
    
        // TODO create enum for role types 
        // create the user
        const role = await this.roleRepository.findOne({where: {name: 'user'}});
        if(!role) {
          throw new Error('Role "user" not found');
        }
    
        const hashedPw = await bcrypt.hash(password, 10);
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
}
