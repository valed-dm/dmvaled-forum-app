export default class ThreadByCategory {
  constructor(
    public threadId: string,
    public categoryName: string,
    public title: string,
    public titleCreatedOn: Date
  ) {}
}
