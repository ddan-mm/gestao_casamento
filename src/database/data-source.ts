import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { GuestEntity } from '../entities/guest';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
  logging: false,
  entities: [GuestEntity],
  migrations: ['src/migrations/**/*.ts'], // ajuste o caminho se necessário
});
