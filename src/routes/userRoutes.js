const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/register', userController.registerGet);
router.get('/login', userController.loginGet);
router.get('/dashboard', userController.dashboardGet);
router.get('/logout', userController.logoutGet);
router.post('/register', userController.registerPost);
router.post('/login', userController.loginPost);

module.exports = router;