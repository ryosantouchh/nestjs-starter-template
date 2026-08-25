import { Column, Entity } from 'typeorm';
import { BaseCoreEntity } from './base-core-entity';

@Entity()
export class User extends BaseCoreEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  username: string | null;

  @Column({ type: 'varchar', nullable: true })
  password: string | null;
}
