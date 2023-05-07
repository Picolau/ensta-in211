import express from 'express';
import { appDataSource } from '../datasource.js';
import User from '../entities/user.js';

const router = express.Router();

router.get('/', function (req, res) {
  appDataSource
    .getRepository(User)
    .find({})
    .then(function (users) {
      res.json({ users: users });
    });
});

router.post('/signup', function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const newUser = userRepository.create({
    email: req.body.email,
    username: req.body.username,
    password: req.body.password,
  });

  userRepository
    .insert(newUser)
    .then(() => {
      res.status(201).json(newUser);
    })
    .catch((error) => {
      console.error(error);
      if (error.code === '23505') {
        res.status(400).json({
          message: `User with email "${newUser.email}" already exists`,
        });
      } else {
        res.status(500).json({ message: 'Error while creating the user' });
      }
    });
});

// returns user by id
router.post('/login', async function (req, res) {
  const userRepository = appDataSource.getRepository(User);

  const user = await userRepository.findOneBy({
    email: req.body.email,
    password: req.body.password,
  });

  if (user) {
    res.status(201).json(user);
  } else {
    res.status(401).json({ message: 'Password or identifier incorrect' });
  }
});

// returns user by id
router.get('/:userId', function (req, res) {
  const user_id = req.params.userId;
  appDataSource
    .getRepository(User)
    .findOneBy({ id: user_id })
    .then(function (user) {
      if (user) {
        res.json({
          id: user.id,
          email: user.email,
          username: user.username,
        });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    })
    .catch(function (error) {
      console.error(error);
      res.status(500).json({ message: 'Error while retrieving the user' });
    });
});

// returns if user exists with email or username
router.post('/exists', function (req, res) {
  const userIdentifier = req.body.identifier;
  const obj = {};
  if (userIdentifier.includes('@')) {
    obj['email'] = userIdentifier;
  } else {
    obj['username'] = userIdentifier;
  }

  appDataSource
    .getRepository(User)
    .findOneBy(obj)
    .then(function (user) {
      if (user) {
        res.json({ userExists: true });
      } else {
        res.json({ userExists: false });
      }
    })
    .catch(function (error) {
      console.error(error);
      res
        .status(500)
        .json({ message: 'Error while retrieving user existance' });
    });
});

// update user of DB
router.put('/:userId', async function (req, res) {
  const userRepository = appDataSource.getRepository(User);
  const user_id = req.params.userId;
  const userToUpdate = await userRepository.findOneBy({ id: user_id });

  if (userToUpdate) {
    userToUpdate.email = req.body.email || userToUpdate.email;
    userToUpdate.firstname = req.body.firstname || userToUpdate.firstname;
    userToUpdate.lastname = req.body.lastname || userToUpdate.lastname;

    await userRepository.update({ id: user_id }, userToUpdate);

    res.json({ user: userToUpdate });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

router.delete('/:userId', function (req, res) {
  appDataSource
    .getRepository(User)
    .delete({ id: req.params.userId })
    .then(function () {
      res.status(204).json({ message: 'User successfully deleted' });
    })
    .catch(function () {
      res.status(500).json({ message: 'Error while deleting the user' });
    });
});

export default router;
