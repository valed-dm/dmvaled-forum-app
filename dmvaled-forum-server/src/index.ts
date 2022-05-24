import express from "express";
import session from "express-session";
import connectRedis from "connect-redis";
import Redis from "ioredis";
import { AppDataSource } from "./data-source";
import bodyParser from "body-parser";
import { ApolloServer } from "apollo-server-express";
import { makeExecutableSchema } from "@graphql-tools/schema";
import typeDefs from "./gql/typedefs";
import resolvers from "./gql/resolvers";
import cors from "cors";
require("dotenv").config();

console.log(process.env.NODE_ENV);

declare module "express-session" {
  interface SessionData {
    userId: any;
  }
}

AppDataSource.initialize()
  .then(async () => {
    const app = express();
    app.use(
      cors({
        credentials: true,
        origin: process.env.CLIENT_URL,
      })
    );
    const router = express.Router();
    const redis = new Redis({
      port: Number(process.env.REDIS_PORT),
      host: process.env.REDIS_HOST,
      password: process.env.REDIS_PASSWORD,
    });
    const RedisStore = connectRedis(session);
    const redisStore = new RedisStore({ client: redis });

    app.use(bodyParser.json());
    app.use(
      session({
        store: redisStore,
        name: process.env.COOKIE_NAME,
        sameSite: "Strict",
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
          path: "/",
          httpOnly: true,
          secure: false,
          maxAge: 1000 * 60 * 60 * 24,
        },
      } as any)
    );

    app.use(router);

    const schema = makeExecutableSchema({
      typeDefs,
      resolvers,
    });
    const apolloServer = new ApolloServer({
      schema,
      context: ({ req, res }: any) => ({ req, res }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, cors: false });

    app.listen({ port: process.env.SERVER_PORT }, () => {
      console.log(
        `Apollo Server ready at http://localhost:${process.env.SERVER_PORT}${apolloServer.graphqlPath}`
      );
    });
  })
  .catch((err) => console.log(err));
