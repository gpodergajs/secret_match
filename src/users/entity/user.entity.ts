import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./role.entity";
import { UsersEvents } from "src/event/user-events.entity";
import { Match } from "src/match/match.entity";

@Entity({ schema: 'secret_match', name: 'users' })
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({unique: true})
    email: string;

    @Column()
    password: string;

    @ManyToOne(() => Role, role => role.users)
    @JoinColumn({name: 'role_id'})
    role: Role;

    @OneToMany(() => UsersEvents, ue => ue.user)
    userEvents: UsersEvents[];

    @OneToMany(() => Match, match => match.user1)
    matchesAsUser1: Match[];

    @OneToMany(() => Match, match => match.user2)
    matchesAsUser2: Match[];
}