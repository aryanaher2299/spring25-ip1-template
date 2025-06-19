import express, { Response, Router } from 'express';
import { UserRequest, User, UserByUsernameRequest } from '../types/types';
import {
  deleteUserByUsername,
  getUserByUsername,
  loginUser,
  saveUser,
  updateUser,
} from '../services/user.service';

const userController = () => {
  const router: Router = express.Router();

  /**
   * Validates that the request body contains all required fields for a user.
   * @param req The incoming request containing user data.
   * @returns `true` if the body contains valid user fields; otherwise, `false`.
   */
  const isUserBodyValid = (req: UserRequest): boolean =>
    typeof req.body?.username === 'string' &&
    req.body.username.trim() !== '' &&
    typeof req.body?.password === 'string' &&
    req.body.password.trim() !== '';

  /**
   * Handles the creation of a new user account.
   * @param req The request containing username, email, and password in the body.
   * @param res The response, either returning the created user or an error.
   * @returns A promise resolving to void.
   */
  const createUser = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).json({ error: 'Invalid user body' });
      return;
    }
    const user: User = {
      ...req.body,
      dateJoined: new Date(),
    };
    const result = await saveUser(user);
    if ('error' in result) {
      const status = result.error === 'Username already exists' ? 409 : 500;
      res.status(status).json(result);
    } else {
      res.status(201).json(result);
    }
  };

  /**
   * Handles user login by validating credentials.
   * @param req The request containing username and password in the body.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const userLogin = async (req: UserRequest, res: Response): Promise<void> => {
    if (!isUserBodyValid(req)) {
      res.status(400).json({ error: 'Invalid user body' });
      return;
    }
    const result = await loginUser(req.body);
    if ('error' in result) {
      res.status(401).json(result);
    } else {
      res.status(200).json(result);
    }
  };

  /**
   * Retrieves a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either returning the user or an error.
   * @returns A promise resolving to void.
   */
  const getUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    const { username } = req.params;
    const result = await getUserByUsername(username);
    if ('error' in result) {
      res.status(404).json(result);
    } else {
      res.status(200).json(result);
    }
  };

  /**
   * Deletes a user by their username.
   * @param req The request containing the username as a route parameter.
   * @param res The response, either the successfully deleted user object or returning an error.
   * @returns A promise resolving to void.
   */
  const deleteUser = async (req: UserByUsernameRequest, res: Response): Promise<void> => {
    const { username } = req.params;
    const result = await deleteUserByUsername(username);
    if ('error' in result) {
      res.status(404).json(result);
    } else {
      res.status(200).json(result);
    }
  };

  /**
   * Resets a user's password.
   * @param req The request containing the username and new password in the body.
   * @param res The response, either the successfully updated user object or returning an error.
   * @returns A promise resolving to void.
   */
  const resetPassword = async (req: UserRequest, res: Response): Promise<void> => {
    const { username, password } = req.body;
    if (!username || !password) {
      res.status(400).json({ error: 'Invalid user body' });
      return;
    }
    const result = await updateUser(username, { password });
    if ('error' in result) {
      res.status(404).json(result);
    } else {
      res.status(200).json(result);
    }
  };

  // Define routes for the user-related operations.
  router.post('/register', createUser); // Create a new user
  router.post('/login', userLogin); // User login
  router.get('/:username', getUser); // Get user by username
  router.patch('/reset-password', resetPassword); // Reset password
  router.delete('/:username', deleteUser); // Delete user by username

  return router;
};

export default userController;
