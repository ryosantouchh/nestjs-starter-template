import { Column, Entity } from 'typeorm';
import { BaseCoreEntity } from './base-core-entity';

@Entity('api_key')
export class ApiKey extends BaseCoreEntity {
  @Column({ type: 'varchar' })
  platform: string;

  @Column({ type: 'varchar' })
  key: string;
}
