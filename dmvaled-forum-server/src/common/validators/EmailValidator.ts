export const isEmailValid = (email: string) => {
  if (!email) return "Email can't be empty.";
  if (!email.includes("@")) return "Please enter valid email address.";
  if (/\s+/g.test(email)) return "Email can't have white spaces.";
  return "";
};
