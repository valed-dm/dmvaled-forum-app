import { QueryArrayResult, QueryOneResult } from "./QueryArrayResult";
import { ThreadCategory } from "./ThreadCategory";
import { Thread } from "./Thread";
import { User } from "./User";
import {
  isThreadTitleValid,
  isThreadBodyValid,
} from "../common/validators/ThreadValidators";
import { AppDataSource } from "../data-source";

export const createThread = async (
  userId: string | null,
  categoryId: string,
  title: string,
  body: string
): Promise<QueryArrayResult<Thread>> => {
  const titleMsg = isThreadTitleValid(title);
  if (titleMsg) {
    return {
      messages: [titleMsg],
    };
  }
  const bodyMsg = isThreadBodyValid(body);
  if (bodyMsg) {
    return {
      messages: [bodyMsg],
    };
  }

  // check if user is logged in for making posts
  if (!userId) {
    return {
      messages: ["User not logged in."],
    };
  }
  const user = await AppDataSource.manager.findOneBy(User, {
    id: userId,
  });
  if (!user) {
    return {
      messages: ["User not found."],
    };
  }
  // check if category exists
  const category = await AppDataSource.manager.findOneBy(ThreadCategory, {
    id: categoryId,
  });
  if (!category) {
    return {
      messages: ["Category not found."],
    };
  }

  const thread = await AppDataSource.manager.save(
    Thread.create({
      title,
      body,
      user,
      category,
    })
  );

  if (!thread) {
    return {
      messages: ["Thread not created."],
    };
  }
  return {
    messages: [thread.id],
  };
};

export const getThreadById = async (
  id: string
): Promise<QueryOneResult<Thread>> => {
  const thread = await AppDataSource.manager.findOne(Thread, {
    where: { id },
    relations: {
      user: true,
      threadItems: { user: true, thread: true },
      category: true,
    },
  });

  if (!thread) {
    return {
      messages: ["Thread not found"],
    };
  }
  return {
    entity: thread,
  };
};

export const getThreadsByCategoryId = async (
  categoryId: string
): Promise<QueryArrayResult<Thread>> => {
  const threads = await Thread.createQueryBuilder("thread")
    .where(`thread."categoryId" = :categoryId`, { categoryId })
    .leftJoinAndSelect("thread.category", "category")
    .leftJoinAndSelect("thread.threadItems", "threadItems")
    .leftJoinAndSelect("thread.user", "user")
    .orderBy("thread.createdOn", "DESC")
    .getMany();
  if (!threads || threads.length === 0) {
    return {
      messages: ["Threads of category with given id not found"],
    };
  }

  return {
    entities: threads,
  };
};

export const getThreadsLatest = async (): Promise<QueryArrayResult<Thread>> => {
  const threads = await Thread.createQueryBuilder("thread")
    .leftJoinAndSelect("thread.category", "category")
    .leftJoinAndSelect("thread.threadItems", "threadItems")
    .leftJoinAndSelect("thread.user", "user")
    .orderBy("thread.createdOn", "DESC")
    .take(10)
    .getMany();

  if (!threads || threads.length === 0) {
    return {
      messages: ["Threads latest not found"],
    };
  }

  return {
    entities: threads,
  };
};
