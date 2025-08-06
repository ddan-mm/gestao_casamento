import 'dotenv/config';
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { GuestEntity } from '../entities/guest';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // coloque aqui sua string do Supabase
  synchronize: true, // só para dev, em produção configure migrations
  logging: false,
  entities: [GuestEntity],
});
