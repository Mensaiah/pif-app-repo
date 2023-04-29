export const calculateLoginWaitingTime = (failedAttempts: number) => {
  if (failedAttempts < 5) {
    return { allowedAttempts: 5, waitingTime: 0 };
  } else if (failedAttempts < 8) {
    return { allowedAttempts: 3, waitingTime: 30 * 60 * 1000 }; // 30 minutes
  } else if (failedAttempts < 11) {
    return { allowedAttempts: 3, waitingTime: 60 * 60 * 1000 }; // 1 hour
  }

  return { allowedAttempts: 3, waitingTime: 3 * 60 * 60 * 1000 }; // 3 hours
};
