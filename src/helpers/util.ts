const bcrypt = require('bcrypt');
const saltRounds = 10;

export const hashPasswordHelper = async (password: string) => {
  try {
    return await bcrypt.hash(password, saltRounds);
  } catch (error) {
    throw new Error('Failed to hash password');
  }
};

export const comparePassword = async (password: string, hash: string) => {
  const result = await bcrypt.compare(password, hash);
  console.log(result);
  return result;
};
