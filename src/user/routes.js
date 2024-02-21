const { Router } = require('express');
const userController = require('./controller');

const router = Router();

router.get('/', (req, res) => {
    res.send('Using API route');
});

router.post('/register', userController.registerUser);

module.exports = router;
