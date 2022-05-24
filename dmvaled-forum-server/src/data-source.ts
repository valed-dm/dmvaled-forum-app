import { DataSource } from "typeorm";
import { User } from "./repo/User";
import { Thread } from "./repo/Thread";
import { ThreadItem } from "./repo/ThreadItem";
import { ThreadPoint } from "./repo/ThreadPoint";
import { ThreadItemPoint } from "./repo/ThreadItemPoint";
import { ThreadCategory } from "./repo/ThreadCategory";
require("dotenv").config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT),
  username: process.env.PG_ACCOUNT,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
  synchronize: process.env.PG_SYNCHRONIZE === "true" ? true : false,
  logging: process.env.PG_LOGGING === "true" ? true : false,
  entities: [
    User,
    Thread,
    ThreadItem,
    ThreadPoint,
    ThreadItemPoint,
    ThreadCategory,
  ],
  subscribers: [],
  migrations: [],
});
