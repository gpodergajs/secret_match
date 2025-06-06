import { Match } from 'src/match/entities/match.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { UsersEvents } from './user-events.entity';


@Entity({ schema: 'secret_match', name: 'events' })
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp' })
  event_date: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @OneToMany(() => UsersEvents, ue => ue.event)
  userEvents: UsersEvents[];

  @OneToMany(() => Match, match => match.event)
  matches: Match[];
}
