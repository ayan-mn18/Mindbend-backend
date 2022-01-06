const passport = require("passport");
const GoogleStrategy = require('passport-google-oauth20').Strategy;

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
User.findById(id, function(err, user) {
    done(err, user);
});
});

passport.use(new GoogleStrategy({
    clientID: `24401141316-0s2bcom30ipbto0qvqup26pvad9t3v2h.apps.googleusercontent.com`,
    clientSecret: `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`,
    callbackURL: "http://localhost:3000/google/callback"
    },
    function(accessToken, refreshToken, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return done(err, user);
        });
    }
));

// const clinetID = 24401141316-0s2bcom30ipbto0qvqup26pvad9t3v2h.apps.googleusercontent.com;
// const clientSecret = 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;