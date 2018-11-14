var express          = require("express"),
    mongoose         = require("mongoose"),
    expressSession   = require("express-session"),
    bodyParser       = require("body-parser"),
    passport         = require("passport"),
    LocalStatregy    = require("passport-local"),
    User             = require("./models/user");
    
mongoose.connect("mongodb://localhost:27017/auth_db", { useNewUrlParser: true });
var app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.use(expressSession({
    secret: "I am good girl",
    resave: false,
    saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStatregy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.set("view engine", "ejs")

//ROUTES

app.get("/", function(req, res) {
    res.render("home");
})

app.get("/secret", isLoggedIn, function(req, res){
    res.render("secret");
})

// Register routes
app.get("/register", function(req, res){
    res.render("register");
})

app.post("/register", function(req, res){
   
    User.register(new User({username: req.body.username}), req.body.password, function(err, user){
        if(err) {
            console.log(err);
        }
        
        passport.authenticate('local')(req, res, function() {
            res.redirect("/secret");
        })
        
        
    })
    
    
})

// login routes
app.get("/login", function(req, res){
    res.render("login");
})


app.post("/login", passport.authenticate('local', 
                    {
                        failureRedirect: "/login",
                        successRedirect: "/secret"
                        
                    }), function(req, res){});
                    
// logout route
app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
})

function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
        console.log("auth successful");
        return next();
    }
    res.redirect("/login");
    
}
app.listen(process.env.PORT, process.env.IP, function() {
    console.log("Authentication server started");
})