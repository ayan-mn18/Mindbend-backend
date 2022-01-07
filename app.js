const express = require("express");
const colors = require("colors");
const passport = require("passport");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");
const { process_params } = require("express/lib/router");
const {OAuth2Client} = require('google-auth-library');
const res = require("express/lib/response");
const CLIENT_ID ='24401141316-b15q4djpt8irdtbm0ejguvcjpkk44l6g.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const { v4: uuidv4 } = require('uuid');

// require('./passport');
const PORT = process.env.PORT || 5000;

const app = express();

//middlewares
app.set('view engine' , 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(cookieSession({
    name: 'Mindbend',
    keys: ['key1' , 'key2']
}))
app.use(cookieParser());
app.use(morgan('dev'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(passport.session());

const db = require('./db');
const User = require('./User');

app.get('/' , (req,res) =>{
    res.render('index');
})

app.get('/login' ,(req,res)=>{
    res.render('login');
})

app.post('/login' , (req,res) =>{
    let token = req.body.token;
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, 
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
    }
    verify()
    .then(()=>{
        res.cookie('session-token', token );
        res.send('success');
    })
    .catch(console.error);
})

app.get('/profile' ,checkAuthenticated , addReferralCode ,async (req,res)=>{
    let user = req.user;
    console.log(user);
    try {
        let UserData = await User.findOne(user); 
        if(UserData == null ){
            await User.create(user);
            // console.log(UserData);
        }
        // console.log(UserData);

    } catch (error) {
        res.status(404).send(error);
    }
    res.render('profile' , {user});
});

app.get('/protectedRoute',checkAuthenticated, (req,res)=>{
    res.send('This Route is protected');
});  

app.get('/logout' , (req,res)=>{
    res.clearCookie('session-token');
    res.redirect('/login');
})

function checkAuthenticated(req,res,next){
    let token = req.cookies['session-token'];

    let user = {};
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID, 
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
        user.picture = payload.picture;
    };
    verify()
    .then(()=>{
        req.user = user;
        next();
    })
    .catch(err =>{
        res.redirect('/login');
    })
}

async function addReferralCode (req,res,next) {
    const findUser = await User.findOne({email : req.user.email});
    if( findUser == null ){
        const referralCode = uuidv4().split('-')[0];
        req.user.referralCode = referralCode;
    }
    else{
        req.user.referralCode = findUser.referralCode ;
    }
    next();
}

app.listen(PORT ,()=>{
    console.log(`Server is up and running on port ${`${PORT}`.bold.yellow}`);
});