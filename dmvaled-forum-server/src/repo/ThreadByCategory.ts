export class ThreadByCategory {
  constructor(
    public threadId: string,
    public categoryId: string,
    public categoryName: string,
    public title: string,
    public titleCreatedOn: Date
  ) {}
}
