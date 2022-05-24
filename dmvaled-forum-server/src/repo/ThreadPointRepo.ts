import { AppDataSource } from "../data-source";
import { Thread } from "./Thread";
import { User } from "./User";
import { ThreadPoint } from "./ThreadPoint";

export const updateThreadPoint = async (
  userId: string,
  threadId: string,
  increment: boolean
): Promise<string> => {
  // todo: first check user is authenticated
  if (!userId || userId === "0") {
    return "User is not authenticated";
  }

  console.log(
    "ThreadPointRepo==============",
    "userId >>",
    userId,
    "threadId >>",
    threadId,
    "increment >>",
    increment,
    "==============ThreadPointRepo"
  );

  let message = "Failed to increment thread point";

  const thread = await AppDataSource.manager.findOne(Thread, {
    where: { id: threadId },
    relations: { user: true },
  });
  if (thread!.user!.id === userId) {
    message = "Error: users aren't allowed to increment their own threads";
    console.log("update Thread point message >> ", message);
    return message;
  }

  const user = await AppDataSource.manager.findOneBy(User, {
    id: userId,
  });

  const existingPoint = await AppDataSource.manager.findOne(ThreadPoint, {
    where: {
      thread: { id: threadId },
      user: { id: userId },
    },
    relations: { thread: true },
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
            await ThreadPoint.remove(existingPoint);
            thread!.points = Number(thread!.points) + 1;
            thread!.lastModifiedOn = new Date();
            await transactionalEntityManager.save(thread!);
            //await thread!.save();
          }
        } else {
          if (!existingPoint.isDecrement) {
            console.log("remove inc");
            await ThreadPoint.remove(existingPoint);
            thread!.points = Number(thread!.points) - 1;
            thread!.lastModifiedOn = new Date();
            await transactionalEntityManager.save(thread!);
            //await thread!.save();
          }
        }
      } else {
        await transactionalEntityManager.save(
          ThreadPoint.create({
            thread: thread!,
            isDecrement: !increment,
            user: user!,
          })
        );

        if (increment) {
          console.log("increment = true");
          thread!.points = Number(thread!.points) + 1;
        } else {
          console.log("increment = false");
          thread!.points = Number(thread!.points) - 1;
        }
        thread!.lastModifiedOn = new Date();
        await transactionalEntityManager.save(thread!);
        //await thread!.save();
      }
      message = `Successfully ${
        increment ? "incremented" : "decremented"
      } thread point.`;
    }
  );

  console.log("update Thread point message >> ", message);
  return message;
};
