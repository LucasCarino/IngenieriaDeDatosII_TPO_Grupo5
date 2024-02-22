const db = require('../../db');
const { pool } = require('../../db');
const bcrypt = require('bcrypt');
const passport = require('passport');

exports.registerGet = (req, res) => {
    res.render('register');
};

exports.loginGet = (req, res) => {
    res.render('login');
}

exports.dashboardGet = (req, res) => {
    res.render('dashboard', { user: req.user.name });
}

exports.logoutGet = (req, res) => {
    req.logOut(function(err) {
        if (err) {
            return next(err);
        }
        req.flash('success_msg', 'Sesión cerrada');
        res.redirect('/user/login');
    });
}

exports.registerPost = async (req, res) => {
    const { name, email, password, role } = req.body;
    
    let errors = [];
    if (!name || !email || !password || !role) {
        errors.push({ message: 'Por favor, rellene todos los campos' });
    }
    if (password.length < 6) {
        errors.push({ message: 'La contraseña debe tener al menos 6 caracteres' });
    }
    if (errors.length > 0) {
        res.render('register', { errors, name, email, password, role });
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        pool.query(
            `SELECT * FROM users
            WHERE email = $1`, [email], (err, results) => {
                if (err) {
                    throw err;
                }
                if (results.rows.length > 0) {
                    errors.push({ message: 'El email ya está registrado' });
                    res.render('register', { errors, name, email, password, role });
                } else {
                    pool.query(
                        `INSERT INTO users (name, email, password, role)
                        VALUES ($1, $2, $3, $4)
                        RETURNING id, password`, [name, email, hashedPassword, role], (err, results) => {
                            if (err) {
                                throw err;
                            }
                            req.flash('success_msg', 'Estás registrado. Por favor, inicia sesión');
                            res.redirect('/user/login');
                        }
                    );
                }
            }
        );
    }
}

exports.loginPost = (req, res, next) => {
    passport.authenticate('local', {
      failureRedirect: '/user/login',
      failureFlash: true
    }, (err, user, info) => {
      if (err) {
        return next(err);
      }
      if (!user) {
        return res.redirect('/user/login');
      }
      req.logIn(user, function(err) {
        if (err) {
          return next(err);
        }
        req.session.user = req.user;
        return res.redirect('/user/dashboard');
      });
    })(req, res, next);
  }

exports.registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const newUser = await db.query('INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *', [name, email, password]);
        res.status(201).json(newUser.rows[0]);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal Server Error');
    }
};
