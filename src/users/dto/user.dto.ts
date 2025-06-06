import { Exclude, Expose } from "class-transformer";

export class UserDto {
    id: number;
    email: string;
    name: string;

    constructor(user: Partial<UserDto>) {
        this.id = user.id!;
        this.name = user.name!
        this.email = user.email!;
    }
}