import { User } from 'src/users/entity/user.entity';
import {Event} from 'src/event/event.entity'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
  Check,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';


@Entity({ schema: 'secret_match', name: 'matches' })
@Unique('unique_match', ['user1', 'user2'])
@Check('no_self_match', '"user1_id" != "user2_id"')
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @PrimaryColumn()
  event_id: number;

  @PrimaryColumn()
  user1_id: number;

  @PrimaryColumn()
  user2_id:number;

  @ManyToOne(() => Event, event => event.matches, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'event_id' })
  event: Event;

  @Column({ type: 'int', default: 1 })
  round_number: number;

  @ManyToOne(() => User, user => user.matchesAsUser1, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user1_id' }) 
  user1: User;

  @ManyToOne(() => User, user => user.matchesAsUser2, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user2_id' })
  user2: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;
}
