export class LoginRequestDto {
    constructor(email: string, password: string) {
        this.email = email;
        this.password = password
    }
    email: string;
    password: string;
}