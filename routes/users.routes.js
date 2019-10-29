const express = require('express');
const router = express.Router();
const { usersController } = require('../controllers');
const { authMiddleware } = require('../middlewares');
const {
    listUsers,
    getUser,
    updateUser,
    removeUser,
} = usersController;

router.route('/').get(authMiddleware(['admin']), listUsers);

router.route('/:id').get(authMiddleware(['admin', 'user']), getUser);

router.route('/:id').put(authMiddleware(['admin', 'user']), updateUser);

router.route('/:id').delete(authMiddleware(['admin', 'user']), removeUser);

module.exports = router;