import { Exclude, Expose } from "class-transformer";

export class UserDto {
    id: number;
    email: string;
    name: string;
    message?: string;
    preferences?: Record<string, any>;

    constructor(user: Partial<UserDto>) {
        this.id = user.id!;
        this.name = user.name!
        this.email = user.email!;
        this.message = user.message;
        this.preferences = user.preferences;
    }
}