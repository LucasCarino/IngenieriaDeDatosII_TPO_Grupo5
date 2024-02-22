const express = require('express');
const session = require('express-session');
const flash = require('express-flash');
const passport = require('passport');
const path = require('path');
const { redis, connectDB } = require('./db');
const RedisStore = require("connect-redis").default;
const router = express.Router();
const cartController = require('./src/controllers/cartController');

const store = new RedisStore({ client: redis });
connectDB();

const userRouter = require('./src/routes/userRoutes');
const productRouter = require('./src/routes/productRoutes');
const cartRouter = require('./src/routes/cartRoutes');

const initializePassport = require('./passportConfig');
initializePassport(passport);

const app = express();
const port = 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'src/views'));

app.use(express.urlencoded({ extended: false }));

app.use(session({
    store: store,
    secret: 'secret',
    resave: false,
    saveUninitialized: false
  })
);


app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.use(async (req, res, next) => {
  if (req.user) {
      const totalItemCount = await cartController.getCartItemCount(req.user.id);
      res.locals.totalItemCount = totalItemCount;
  }
  next();
});

app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "img-src 'self' https:");
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});

// routes
app.get('/', (req, res) => {
  res.render('index');
});

app.use('/user', userRouter);
app.use('/products', productRouter);
app.use('/cart', cartRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});