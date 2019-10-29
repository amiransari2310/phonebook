const express = require('express');
const router = express.Router();
const { contactsController } = require('../controllers');
const { authMiddleware } = require('../middlewares');
const {
    listContacts,
    createContact,
    getContact,
    updateContact,
    removeContact,
} = contactsController;

router.route('/').get(authMiddleware(['admin', 'user']), listContacts);

router.route('/').post(authMiddleware(['admin', 'user']), createContact);

router.route('/:id').get(authMiddleware(['admin', 'user']), getContact);

router.route('/:id').put(authMiddleware(['admin', 'user']), updateContact);

router.route('/:id').delete(authMiddleware(['admin', 'user']), removeContact);

module.exports = router;