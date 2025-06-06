import { Exclude, Expose } from "class-transformer";

export class UserDto {
    id: number;
    email: string;
    name: string;

    constructor(partial: Partial<UserDto>) {
        Object.assign(this, partial);
    }
}