import { User } from 'src/users/entity/user.entity';
import { Event } from 'src/event/event.entity'
import { Entity, PrimaryColumn, ManyToOne, Column, JoinColumn } from 'typeorm';

@Entity({ schema: 'secret_match', name: 'users_events' })
export class UsersEvents {
  @PrimaryColumn()
  user_id: number;

  @PrimaryColumn()
  event_id: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  registered_at: Date;

  @ManyToOne(() => User, user => user.userEvents, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Event, event => event.userEvents, { onDelete: 'CASCADE', onUpdate: 'CASCADE' })
  @JoinColumn({ name: 'event_id' }) 
  event: Event;
}