import { QueryArrayResult } from "./QueryArrayResult";
import { ThreadItem } from "./ThreadItem";
import { Thread } from "./Thread";
import { User } from "./User";
import { isThreadBodyValid } from "../common/validators/ThreadValidators";
import { AppDataSource } from "../data-source";

export const createThreadItem = async (
  userId: string | undefined | null,
  threadId: string,
  body: string
): Promise<QueryArrayResult<ThreadItem>> => {
  const bodyMsg = isThreadBodyValid(body);
  if (bodyMsg) {
    return {
      messages: [bodyMsg],
    };
  }

  // users must be logged in to create threadItem
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
  const thread = await AppDataSource.manager.findOneBy(Thread, {
    id: threadId,
  });
  if (!thread) {
    return {
      messages: ["Thread not found."],
    };
  }

  const threadItem = await ThreadItem.create({
    body,
    user,
    thread,
  }).save();
  if (!threadItem) {
    return {
      messages: ["Failed to create ThreadItem."],
    };
  }

  return {
    messages: [threadItem.id],
  };
};

export const getThreadItemsByThreadId = async (
  threadId: string
): Promise<QueryArrayResult<ThreadItem>> => {
  const threadItems = await ThreadItem.createQueryBuilder("ti")
    .where(`ti."threadId" = :threadId`, { threadId })
    .leftJoinAndSelect("ti.thread", "thread")
    .orderBy("ti.createdOn", "DESC")
    .getMany();

  if (threadItems.length === 0) {
    return {
      messages: ["ThreadItems of thread with given id not found."],
    };
  }

  return {
    entities: threadItems,
  };
};
