import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm";
import { Thread } from "./Thread";
import { User } from "./User";
import { Auditable } from "./Auditable";

@Entity({ name: "ThreadPoints" })
export class ThreadPoint extends Auditable {
  @PrimaryGeneratedColumn({
    name: "Id",
    type: "bigint",
  }) // for typeorm
  id: string;

  @Column("boolean", {
    name: "IsDecrement",
    default: false,
    nullable: false,
  })
  isDecrement: boolean;

  @ManyToOne(() => User, (user) => user.threadPoints)
  user: User;

  @ManyToOne(() => Thread, (thread) => thread.threadPoints)
  thread: Thread;
}
