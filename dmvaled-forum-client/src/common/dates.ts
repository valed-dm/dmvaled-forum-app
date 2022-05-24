import { format, differenceInMinutes } from "date-fns";

const StandardDateTimeFormat = "dd/MM/yyyy";
const getTimePastIfLessThanDay = (compTime: Date | null): string => {
  if (!compTime) return "";

  const diffInMinutes = differenceInMinutes(new Date(), compTime);

  if (diffInMinutes > 60) {
    if (diffInMinutes > 24 * 60) {
      return format(compTime, StandardDateTimeFormat);
    }
    return Math.round(diffInMinutes / 60) + " hours ago";
  }
  return Math.round(diffInMinutes) + " minutes ago";
};

export { getTimePastIfLessThanDay };
