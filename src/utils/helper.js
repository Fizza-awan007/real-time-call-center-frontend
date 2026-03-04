export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return emailRegex.test(email) && !email.includes("..");
};

export const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&^(){}[\]<>.,;:'"`~|\\])[A-Za-z\d@$!%*?&^(){}[\]<>.,;:'"`~|\\]{8,}$/;
  return passwordRegex.test(password);
};
