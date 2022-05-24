import { User } from "./User";
import bcrypt from "bcryptjs";
import { isPasswordValid } from "../common/validators/PasswordValidator";
import { isEmailValid } from "../common/validators/EmailValidator";
import { AppDataSource } from "../data-source";

const saltRounds = 10;

export class UserResult {
  constructor(public messages?: Array<string>, public user?: User) {}
}

export const register = async (
  email: string,
  userName: string,
  password: string
): Promise<UserResult> => {
  const result = isPasswordValid(password);
  if (!result.isValid) {
    return {
      messages: [
        "Password must have min length 8, 1 upper character, 1 number and 1 symbol",
      ],
    };
  }
  const trimmedEmail = email.trim().toLowerCase();
  const emailErrorMsg = isEmailValid(trimmedEmail);
  if (emailErrorMsg) {
    return { messages: [emailErrorMsg] };
  }

  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(password, salt);

  const userEntity = await User.create({
    email: trimmedEmail,
    userName,
    password: hashedPassword,
  }).save();

  userEntity.password = ""; // password info erased for security

  return { user: userEntity };
};

export const login = async (
  userName: string,
  password: string
): Promise<UserResult> => {
  const user = await AppDataSource.manager.findOneBy(User, {
    userName: userName,
  });

  if (!user) {
    return {
      messages: [userNotFound(userName)],
    };
  }
  if (!user.confirmed) {
    return {
      messages: ["User hasn't confirmed their registration email yet"],
    };
  }
  const passwordMatch = await bcrypt.compare(password, user?.password);
  if (!passwordMatch) {
    return {
      messages: ["Password mismatch"],
    };
  }

  return {
    user: user,
  };
};

export const logout = async (userId: string): Promise<string> => {
  console.log("logout", userId);
  if (!userId) {
    return "User not logged in";
  }
  const user = await AppDataSource.manager.findOneBy(User, {
    id: userId,
  });

  return `User with userName ${user?.userName} successfully logged off.`;
};

export const me = async (id: string): Promise<UserResult> => {
  const user = await AppDataSource.manager.findOne(User, {
    where: { id },
    relations: {
      threads: { threadItems: { thread: true } },
      threadItems: { thread: true },
    },
  });
  if (!user) {
    return {
      messages: ["User not found"],
    };
  }
  if (!user.confirmed) {
    return {
      messages: ["User has not confirmed registration email yet"],
    };
  }
  return {
    user: user,
  };
};

export const changePassword = async (
  id: string,
  newPassword: string
): Promise<string> => {
  const user = await AppDataSource.manager.findOne(User, {
    where: { id },
  });

  if (!user) {
    return "User not found.";
  }

  if (!user.confirmed) {
    return "User has not confirmed their registration email yet.";
  }

  const salt = await bcrypt.genSalt(saltRounds);
  const hashedPassword = await bcrypt.hash(newPassword, salt);
  user.password = hashedPassword;
  user.save();
  return "Password changed successfully.";
};

function userNotFound(userName: string) {
  return `User with userName ${userName} not found.`;
}
