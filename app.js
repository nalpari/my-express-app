const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const multer = require('multer');
const mime = require('mime-types');
const {v4: uuid} = require('uuid');
const cors = require('cors')

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors())

const storage = multer.diskStorage({ // (2)
  destination: (req, file, cb) => { // (3)
    cb(null, "images");
  },
  filename: (req, file, cb) => { // (4)
    cb(null, `${uuid()}.${mime.extension(file.mimetype)}`); // (5)
  },
});

const upload = multer({ // (6)
  storage,
  fileFilter: (req, file, cb) => {
    if (["image/jpeg", "image/jpg", "image/png"].includes(file.mimetype))
      cb(null, true);
    else
      cb(new Error("해당 파일의 형식을 지원하지 않습니다."), false);
  }
  ,
  limits: {
    fileSize: 1024 * 1024 * 5
  }
});

app.post("/api/upload", upload.single("file"), (req, res) => { // (7)
  res.status(200).json(req.file);
});

app.post("/api/upload/multi", upload.array("files"), (req, res) => { // (7)
  console.log(req.files)
  res.status(200).json(req.files);
});

app.use("/images", express.static(path.join(__dirname, "/images")));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
