import { Thread } from "./Thread";
import { ThreadCategory } from "./ThreadCategory";
import { ThreadByCategory } from "./ThreadByCategory";

export const getTopCategoryThread = async (): Promise<
  Array<ThreadByCategory>
> => {
  const categories = await ThreadCategory.createQueryBuilder("threadCategory")
    .leftJoinAndSelect("threadCategory.threads", "thread")
    .getMany();

  console.log("ThreadByCategory - categories", categories);

  const categoryThreads: Array<ThreadByCategory> = [];

  // sort categories with most threads on top then arrange by descending order
  categories.sort((a: ThreadCategory, b: ThreadCategory) => {
    if (a.threads.length > b.threads.length) return -1;
    if (a.threads.length < b.threads.length) return 1;
    return 0;
  });

  const topCats = categories.slice(0, 3);
  // sort the threads by createdOn desc
  topCats.forEach((cat) => {
    cat.threads.sort((a: Thread, b: Thread) => {
      if (a.createdOn > b.createdOn) return -1;
      if (a.createdOn < b.createdOn) return 1;
      return 0;
    });
    cat.threads.forEach((th) => {
      categoryThreads.push(
        new ThreadByCategory(th.id, cat.id, cat.name, th.title, th.createdOn)
      );
    });
  });

  console.log("ThreadByCategory - categoryThreads", categoryThreads);
  return categoryThreads;
};
