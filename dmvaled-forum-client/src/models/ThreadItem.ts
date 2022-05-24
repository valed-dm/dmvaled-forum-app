import Thread from "./Thread";
import User from "./User";

export default class ThreadItem {
  constructor(
    public id: string,
    public views: number,
    public points: number,
    public body: string,
    public user: User,
    public lastModifiedOn: Date,
    public thread?: Thread,
    public threadId?: string
  ) {}
}
