import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import type { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Role } from '../../auth/role.constant';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  name: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: true, select: false })
  password: string | null;

  @Column({ type: 'simple-json', default: JSON.stringify([Role.User]) })
  roles: Role[];

  @Column({ type: 'datetime', nullable: true })
  lastLoginAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Exclude()
  @DeleteDateColumn({ nullable: true })
  deletedAt: Date | null;

  @Exclude()
  @VersionColumn()
  version: number;

  @Exclude()
  @OneToMany('RefreshToken', (refreshToken: RefreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
