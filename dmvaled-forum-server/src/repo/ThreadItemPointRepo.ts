import { AppDataSource } from "../data-source";
import { ThreadItem } from "./ThreadItem";
import { User } from "./User";
import { ThreadItemPoint } from "./ThreadItemPoint";

export const updateThreadItemPoint = async (
  userId: string,
  threadItemId: string,
  increment: boolean
): Promise<string> => {
  // todo: first check user is authenticated
  if (!userId || userId === "0") {
    return "User is not authenticated";
  }

  console.log(
    "ThreadItemPointRepo==============",
    "userId >>",
    userId,
    "threadId >>",
    threadItemId,
    "increment >>",
    increment,
    "==============ThreadItemPointRepo"
  );

  let message = "Failed to increment threadItem point";

  const threadItem = await AppDataSource.manager.findOne(ThreadItem, {
    where: { id: threadItemId },
    relations: { user: true },
  });
  if (threadItem!.user!.id === userId) {
    message = "Error: users aren't allowed to increment their own threadItems";
    console.log("update ThreadItem point message >> ", message);
    return message;
  }

  const user = await AppDataSource.manager.findOneBy(User, {
    id: userId,
  });

  const existingPoint = await AppDataSource.manager.findOne(ThreadItemPoint, {
    where: {
      threadItem: { id: threadItemId },
      user: { id: userId },
    },
    relations: { threadItem: true },
  });
  console.log(
    "======existing point=======",
    existingPoint,
    "======existing point======="
  );

  await AppDataSource.manager.transaction(
    async (transactionalEntityManager) => {
      if (existingPoint) {
        if (increment) {
          if (existingPoint.isDecrement) {
            console.log("remove dec");
            await ThreadItemPoint.remove(existingPoint);
            threadItem!.points = Number(threadItem!.points) + 1;
            threadItem!.lastModifiedOn = new Date();
            await transactionalEntityManager.save(threadItem!);
            //await threadItem!.save();
          }
        } else {
          if (!existingPoint.isDecrement) {
            console.log("remove inc");
            await ThreadItemPoint.remove(existingPoint);
            threadItem!.points = Number(threadItem!.points) - 1;
            threadItem!.lastModifiedOn = new Date();
            await transactionalEntityManager.save(threadItem!);
            //await threadItem!.save();
          }
        }
      } else {
        await transactionalEntityManager.save(
          ThreadItemPoint.create({
            threadItem: threadItem!,
            isDecrement: !increment,
            user: user!,
          })
        );

        if (increment) {
          console.log("increment = true");
          threadItem!.points = Number(threadItem!.points) + 1;
        } else {
          console.log("increment = false");
          threadItem!.points = Number(threadItem!.points) - 1;
        }
        threadItem!.lastModifiedOn = new Date();
        await transactionalEntityManager.save(threadItem!);
        //await threadItem!.save();
      }
      message = `Successfully ${
        increment ? "incremented" : "decremented"
      } threadItem point.`;
    }
  );

  console.log("update ThreadItem point message >> ", message);
  return message;
};
