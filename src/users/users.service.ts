import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.saveUser(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: {
        createdAt: 'DESC',
        id: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    this.usersRepository.merge(user, updateUserDto);
    return this.saveUser(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (result.affected !== 1) {
      throw new NotFoundException(`User ${id} not found`);
    }
  }

  private async saveUser(user: User): Promise<User> {
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('A user with this email already exists');
      }

      throw error;
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    if (!(error instanceof QueryFailedError)) {
      return false;
    }

    const driverError = error.driverError as
      | {
          code?: string;
          message?: string;
        }
      | undefined;

    return (
      driverError?.code === 'SQLITE_CONSTRAINT_UNIQUE' ||
      driverError?.code === 'SQLITE_CONSTRAINT' ||
      driverError?.message?.includes('UNIQUE constraint failed') === true
    );
  }
}
