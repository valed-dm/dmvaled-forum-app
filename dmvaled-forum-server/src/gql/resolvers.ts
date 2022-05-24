import { IResolvers } from "@graphql-tools/utils";
import { GqlContext } from "./GqlContext";
import { User } from "../repo/User";
import { Thread } from "../repo/Thread";
import { ThreadItem } from "../repo/ThreadItem";
import { ThreadCategory } from "../repo/ThreadCategory";
import { ThreadByCategory } from "../repo/ThreadByCategory";
import { QueryOneResult, QueryArrayResult } from "../repo/QueryArrayResult";
import { getAllCategories } from "../repo/ThreadCategoryRepo";
import { getTopCategoryThread } from "../repo/ThreadByCategoryRepo";
import { updateThreadPoint } from "../repo/ThreadPointRepo";
import { updateThreadItemPoint } from "../repo/ThreadItemPointRepo";
import {
  UserResult,
  register,
  login,
  logout,
  changePassword,
  me,
} from "../repo/UserRepo";
import {
  createThread,
  getThreadById,
  getThreadsByCategoryId,
  getThreadsLatest,
} from "../repo/ThreadRepo";
import {
  createThreadItem,
  getThreadItemsByThreadId,
} from "../repo/ThreadItemRepo";

interface EntityResult {
  messages: Array<string>;
}

const resolvers: IResolvers = {
  UserResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "User";
    },
  },
  ThreadResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "Thread";
    },
  },
  ThreadArrayResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "ThreadArray";
    },
  },
  ThreadItemArrayResult: {
    __resolveType(obj: any, context: GqlContext, info: any) {
      if (obj.messages) {
        return "EntityResult";
      }
      return "ThreadItemArray";
    },
  },
  Query: {
    getAllCategories: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<Array<ThreadCategory> | EntityResult> => {
      let categories: QueryArrayResult<ThreadCategory>;
      try {
        categories = await getAllCategories();
        if (categories.entities) {
          return categories.entities;
        }
        return {
          messages: categories.messages
            ? categories.messages
            : ["Categories not found"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    me: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<User | EntityResult> => {
      let user: UserResult;
      try {
        if (!ctx.req.session?.userId) {
          return { messages: ["User not logged in"] };
        }
        user = await me(ctx.req.session.userId);
        if (user && user.user) {
          console.log("user object:", user);
          return user.user;
        }
        return { messages: user.messages ? user.messages : ["STANDART_ERROR"] };
      } catch (ex) {
        throw ex;
      }
    },
    getThreadById: async (
      obj: any,
      args: { threadId: string },
      ctx: GqlContext,
      info: any
    ): Promise<Thread | EntityResult> => {
      let thread: QueryOneResult<Thread>;
      try {
        thread = await getThreadById(args.threadId);
        if (thread.entity) {
          return thread.entity;
        }
        return {
          messages: thread.messages ? thread.messages : ["test"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getThreadsByCategoryId: async (
      obj: any,
      args: { categoryId: string },
      ctx: GqlContext,
      info: any
    ): Promise<{ threads: Array<Thread> } | EntityResult> => {
      let threads: QueryArrayResult<Thread>;
      try {
        threads = await getThreadsByCategoryId(args.categoryId);
        if (threads.entities) {
          return {
            threads: threads.entities,
          };
        }
        return {
          messages: threads.messages
            ? threads.messages
            : ["An error when getting threads by category occured"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getThreadsLatest: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<{ threads: Array<Thread> } | EntityResult> => {
      let threads: QueryArrayResult<Thread>;
      try {
        threads = await getThreadsLatest();
        if (threads.entities) {
          return {
            threads: threads.entities,
          };
        }
        return {
          messages: threads.messages
            ? threads.messages
            : ["An error when getting latest threads occured"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getThreadItemsByThreadId: async (
      obj: any,
      args: { threadId: string },
      ctx: GqlContext,
      info: any
    ): Promise<{ threadItems: Array<ThreadItem> } | EntityResult> => {
      let threadItems: QueryArrayResult<ThreadItem>;
      try {
        threadItems = await getThreadItemsByThreadId(args.threadId);
        if (threadItems.entities) {
          return {
            threadItems: threadItems.entities,
          };
        }
        return {
          messages: threadItems.messages
            ? threadItems.messages
            : ["An error when getting threadItems by threadId occured"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    getTopCategoryThread: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<Array<ThreadByCategory>> => {
      try {
        return await getTopCategoryThread();
      } catch (ex) {
        console.log(ex.message);
        throw ex;
      }
    },
  },
  Mutation: {
    register: async (
      obj: any,
      args: { email: string; userName: string; password: string },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let user: UserResult;
      try {
        user = await register(args.email, args.userName, args.password);
        if (user && user.user) {
          return "Registration successful.";
        }
        return user && user.messages
          ? user.messages[0]
          : `Registration of user ${args.userName} failed.`;
      } catch (ex) {
        throw ex;
      }
    },
    login: async (
      obj: any,
      args: { userName: string; password: string },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let user: UserResult;
      try {
        user = await login(args.userName, args.password);
        if (user && user.user) {
          ctx.req.session!.userId = user.user.id;

          console.log(ctx.req.session);
          return `User with userName ${args.userName} and userId ${
            ctx.req.session!.userId
          } successfully logged in.`;
        }
        return user && user.messages
          ? user.messages[0]
          : `User ${args.userName} failed to log in`;
      } catch (ex) {
        console.log(ex.message);
        throw ex;
      }
    },
    logout: async (
      obj: any,
      args: null,
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      try {
        let result = await logout(ctx.req.session!.userId);
        ctx.req.session?.destroy((err: any) => {
          if (err) {
            console.log("destroy session failed");
            return;
          }
          console.log("session destroyed", ctx.req.session);
        });
        return result;
      } catch (ex) {
        throw ex;
      }
    },
    changePassword: async (
      obj: any,
      args: { newPassword: string },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      try {
        if (!ctx.req.session || !ctx.req.session!.userId) {
          return "You must be logged in before you can change your password.";
        }
        let result = await changePassword(
          ctx.req.session!.userId,
          args.newPassword
        );

        return result;
      } catch (ex) {
        throw ex;
      }
    },
    createThread: async (
      obj: any,
      args: { userId: string; categoryId: string; title: string; body: string },
      ctx: GqlContext,
      info: any
    ): Promise<EntityResult> => {
      let result: QueryOneResult<Thread>;
      try {
        result = await createThread(
          args.userId,
          args.categoryId,
          args.title,
          args.body
        );
        return {
          messages: result.messages
            ? result.messages
            : ["An error when creating thread has occured"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    createThreadItem: async (
      obj: any,
      args: { userId: string; threadId: string; body: string }
    ): Promise<EntityResult> => {
      let result: QueryOneResult<ThreadItem>;
      try {
        result = await createThreadItem(args.userId, args.threadId, args.body);
        return {
          messages: result.messages
            ? result.messages
            : ["An error when creating threadItem has occured"],
        };
      } catch (ex) {
        throw ex;
      }
    },
    updateThreadPoint: async (
      obj: any,
      args: { threadId: string; increment: boolean },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let msg = "";
      try {
        console.log("resolvers==============", args, "==============resolvers");
        if (!ctx.req.session || !ctx.req.session?.userId) {
          return "User must be logged in to set likes";
        }
        msg = await updateThreadPoint(
          ctx.req.session!.userId,
          args.threadId,
          args.increment
        );
        return msg;
      } catch (ex) {
        throw ex;
      }
    },
    updateThreadItemPoint: async (
      obj: any,
      args: { threadItemId: string; increment: boolean },
      ctx: GqlContext,
      info: any
    ): Promise<string> => {
      let msg = "";
      try {
        console.log("resolvers==============", args, "==============resolvers");
        if (!ctx.req.session || !ctx.req.session?.userId) {
          return "User must be logged in to set likes";
        }
        msg = await updateThreadItemPoint(
          ctx.req.session!.userId,
          args.threadItemId,
          args.increment
        );
        return msg;
      } catch (ex) {
        throw ex;
      }
    },
  },
};

export default resolvers;
