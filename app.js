let express=require('express');
let path=require('path');
let app=express();

const config=require("./config/database");

const passport = require('passport');

app.set('views',path.join(__dirname,'views'));
app.set('view engine','pug');

//STATIC FOLDER
app.use(express.static(path.join(__dirname,'public')));

app.listen(3000,function(){
    console.log("listening on port 3000...");
});


//Mongoose Config
let mongoose =require('mongoose');
mongoose.connect(config.database);
let db=mongoose.connection;

db.on('error',function(err){
    console.log(err);
});

db.once('open',function(){
    console.log("Connected to mongodb !!!");
});

let Article = require('./models/article');


//Body Parser Config
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



const expressValidator= require('express-validator');
const flash=require('connect-flash');
const session=require('express-session');

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
  }))

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

//Express Validator Middleware
app.use(expressValidator({
    errorFormatter:function(param,msg,value){
        var namespace=param.split("."),
        root=namespace.shift(),
        formParam=root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param:formParam,
            msg:msg,
            value:value
        };
    }
}));

//Passport Config
require('./config/passport')(passport);
//Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*',function(req,res,next){
    res.locals.user =req.user || null;
    next();
});

//Route to display all Articles (Index Route)
app.get('/',function(req,res){
    Article.find({},function(err,articles){
        if(err){
            console.log(err);
        }
        else{
            res.render('index',{
                title:'Index Page',
                articles:articles
            });
        }
    });
});

// Article Routes
let articleRoutes=require("./routes/articles");
app.use("/articles",articleRoutes);

// User Routes
let userRoutes=require("./routes/users");
app.use("/users",userRoutes);

