import UserModel from '../../models/users.model';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  updateUser,
} from '../../services/user.service';
import { SafeUser, User, UserCredentials } from '../../types/user';
import { user, safeUser } from '../mockData.models';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const mockingoose = require('mockingoose');

describe('User model', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  describe('saveUser', () => {
    beforeEach(() => {
      mockingoose.resetAll();
    });

    it('should return the saved user', async () => {
      mockingoose(UserModel).toReturn(user, 'create');

      const savedUser = (await saveUser(user)) as SafeUser;

      expect(savedUser._id).toBeDefined();
      expect(savedUser.username).toEqual(user.username);
      expect(savedUser.dateJoined).toEqual(user.dateJoined);
    });

    // TODO: Task 1 - Write additional test cases for saveUser
  });
});

describe('getUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the matching user', async () => {
    const mockedUser = {
      toObject: () => ({
        _id: user._id,
        username: user.username,
        password: user.password, // Required internally but excluded from returned result
        dateJoined: user.dateJoined,
      }),
    };

    mockingoose(UserModel).toReturn(mockedUser, 'findOne');

    const result = await getUserByUsername(user.username);

    if ('error' in result) {
      throw new Error(`Expected a user, but got error: ${result.error}`);
    }

    expect(result).toMatchObject({
      username: user.username,
      dateJoined: user.dateJoined,
    });
  });
});

describe('loginUser', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the user if authentication succeeds', async () => {
    const mockedUser = {
      password: user.password, // <- Important for password check
      toObject: () => ({
        _id: user._id,
        username: user.username,
        password: user.password,
        dateJoined: user.dateJoined,
      }),
    };

    mockingoose(UserModel).toReturn(mockedUser, 'findOne');

    const credentials: UserCredentials = {
      username: user.username,
      password: user.password,
    };

    const result = await loginUser(credentials);

    if ('error' in result) throw new Error('Expected user, got error');

    expect(result).toMatchObject({
      username: user.username,
      dateJoined: user.dateJoined,
    });
  });

  it('should return error if user does not exist', async () => {
    mockingoose(UserModel).toReturn(null, 'findOne');
    const credentials: UserCredentials = {
      username: user.username,
      password: user.password,
    };
    const result = await loginUser(credentials);
    expect(result).toEqual({ error: 'Invalid username or password' });
  });

  it('should return error if password is incorrect', async () => {
    mockingoose(UserModel).toReturn({ ...user, password: 'differentPassword' }, 'findOne');
    const credentials: UserCredentials = {
      username: user.username,
      password: 'wrongPassword',
    };
    const result = await loginUser(credentials);
    expect(result).toEqual({ error: 'Invalid username or password' });
  });

  // TODO: Task 1 - Write additional test cases for loginUser
});

describe('deleteUserByUsername', () => {
  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the deleted user when deleted succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUser, 'findOneAndDelete');

    const deletedUser = (await deleteUserByUsername(user.username)) as SafeUser;

    expect(deletedUser.username).toEqual(user.username);
    expect(deletedUser.dateJoined).toEqual(user.dateJoined);
  });

  it('should return error if user does not exist', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndDelete');
    const result = await deleteUserByUsername(user.username);
    expect(result).toEqual({ error: 'User not found' });
  });

  // TODO: Task 1 - Write additional test cases for deleteUserByUsername
});

describe('updateUser', () => {
  const updatedUser: User = {
    ...user,
    password: 'newPassword',
  };

  const safeUpdatedUser: SafeUser = {
    username: user.username,
    dateJoined: user.dateJoined,
  };

  const updates: Partial<User> = {
    password: 'newPassword',
  };

  beforeEach(() => {
    mockingoose.resetAll();
  });

  it('should return the updated user when updated succesfully', async () => {
    mockingoose(UserModel).toReturn(safeUpdatedUser, 'findOneAndUpdate');

    const result = (await updateUser(user.username, updates)) as SafeUser;

    expect(result.username).toEqual(user.username);
    expect(result.username).toEqual(updatedUser.username);
    expect(result.dateJoined).toEqual(user.dateJoined);
    expect(result.dateJoined).toEqual(updatedUser.dateJoined);
  });

  it('should return error if user does not exist', async () => {
    mockingoose(UserModel).toReturn(null, 'findOneAndUpdate');
    const result = await updateUser(user.username, { password: 'newPassword' });
    expect(result).toEqual({ error: 'User not found' });
  });

  // TODO: Task 1 - Write additional test cases for updateUser
});

afterEach(() => {
  jest.clearAllMocks();
});
