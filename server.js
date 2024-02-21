const express = require('express');
const userRouter = require('./src/user/routes');
const { pool } = require('./db');
const bcrypt = require('bcrypt');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');

const initializePassport = require('./passportConfig');

initializePassport(passport);

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
    })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.get('/', (req, res) => {
    res.render('index');
});

app.get('/users/register', (req, res) => {
    res.render('register');
});

app.get('/users/login', (req, res) => {
    res.render('login');
});

app.get('/users/dashboard', (req, res) => {
    console.log(req);
    res.render('dashboard', { user: req.user.name });
});

app.get('/users/logout', (req, res) => {
    req.logOut(function(err) {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'Sesión cerrada');
        res.redirect('/users/login');
    });
});

app.post('/users/register', async (req, res) => {
    const { name, email, password, role } = req.body;
    // console.log('name:', name, 'email:', email, 'password:', password, 'role:', role);
    
    let errors = [];

    if (!name || !email || !password || !role) {
        errors.push({ message: 'Por favor, complete todos los campos' });
    }

    if (password.length < 6) {
        errors.push({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }

    if (errors.length > 0) {
        res.render('register', { errors });
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        console.log(hashedPassword);

        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email],
            (err, results) => {
                if (err) {
                    throw err;
                }
                console.log(results.rows);
                console.log("hola")
                if (results.rows.length > 0) {
                    errors.push({ message: 'El email ya está registrado' });
                    res.render('register', { errors });
                } else {
                    pool.query(
                        `INSERT INTO users (name, email, password, role)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id, password`, [name, email, hashedPassword, role],
                        (err, results) => {
                            if (err) {
                                throw err;
                            }
                            console.log(results.rows);
                            req.flash('success_msg', 'Registro exitoso');
                            res.redirect('/users/login');
                        }
                    );
                }
            }
        );
    }
});

app.post('/users/login', passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
}));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});