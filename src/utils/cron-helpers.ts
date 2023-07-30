import ms from 'ms';

type TimeInput = string | number;

export const getTimeInCronFormat = (time: TimeInput): string => {
  if (typeof time === 'string' && time.startsWith('every')) {
    const timeFormatRegex =
      /^every (\d+|\d+\.\d+)(ms|millisecond|milliseconds|s|second|seconds|m|minute|minutes|h|hour|hours|d|day|days|w|week|weeks|month|months|y|year|years)$/;
    if (!timeFormatRegex.test(time)) {
      throw new Error(
        'Invalid time string. Time string must be in a format like "every 1 hour", "every 2 days", etc.'
      );
    }
    const timeValue = time.slice(6); // Remove "every " from the start
    const milliseconds = ms(timeValue);
    if (!milliseconds) {
      throw new Error(
        'Invalid time string. Time string must be in a format like "every 1 hour", "every 2 days", etc.'
      );
    }

    // Convert the time to a cron field
    const seconds = milliseconds / 1000;
    const minutes = seconds / 60;
    const hours = minutes / 60;
    const days = hours / 24;
    const weeks = days / 7;
    const months = days / 30.44; // Average number of days in a month

    if (months >= 1) {
      return `0 0 1 */${Math.round(months)} *`; // Every N months
    } else if (weeks >= 1) {
      return `0 0 */${Math.round(weeks * 7)} * *`; // Every N weeks
    } else if (days >= 1) {
      return `0 0 */${Math.round(days)} * *`; // Every N days
    } else if (hours >= 1) {
      return `0 */${Math.round(hours)} * * *`; // Every N hours
    } else if (minutes >= 1) {
      return `*/${Math.round(minutes)} * * * *`; // Every N minutes
    } else {
      return `*/${Math.round(seconds)} * * * * *`; // Every N seconds
    }
  }

  let date: Date;

  if (typeof time === 'string') {
    const timeFormatRegex =
      /^(\d+|\d+\.\d+)(ms|millisecond|milliseconds|s|second|seconds|m|minute|minutes|h|hour|hours|d|day|days|w|week|weeks|month|months|y|year|years)( \d+(\.\d+)?(ms|millisecond|milliseconds|s|second|seconds|m|minute|minutes|h|hour|hours|d|day|days|w|week|weeks|month|months|y|year|years))*$/;
    if (!timeFormatRegex.test(time)) {
      throw new Error(
        'Invalid time string. Time string must be in a format like "3d", "2h", "1y", "1 day 2 hours 30 minutes", etc.'
      );
    }
    const milliseconds = ms(time);
    if (!milliseconds) {
      throw new Error(
        'Invalid time string. Time string must be in a format like "3d", "2h", "1y", "1 day 2 hours 30 minutes", etc.'
      );
    }
    date = new Date(Date.now() + milliseconds);
  } else if (typeof time === 'number') {
    date = new Date(time);
  } else {
    throw new Error('Invalid time format. Time must be a string or a number.');
  }

  const minute = date.getUTCMinutes();
  const hour = date.getUTCHours();
  const dayOfMonth = date.getUTCDate();
  const month = date.getUTCMonth() + 1; // Months in JavaScript start from 0
  const dayOfWeek = date.getUTCDay();

  // Returns a cron expression
  return `${minute} ${hour} ${dayOfMonth} ${month} ${dayOfWeek}`;
};
