const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const User = require("../models/User");
const config = require("./config");

// Serialize user for session (not used for JWT, but required by passport)
passport.serializeUser((user, done) => {
    done(null, user.id);
});
passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => done(err, user));
});

// Google OAuth Strategy (temporarily disabled)
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: config.OAUTH.GOOGLE.CLIENT_ID,
//       clientSecret: config.OAUTH.GOOGLE.CLIENT_SECRET,
//       callbackURL: "/api/auth/google/callback",
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ email: profile.emails[0].value });
//         if (!user) {
//           user = await User.create({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             password: Math.random().toString(36), // random password
//             avatar: profile.photos[0]?.value || "",
//           });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

// Facebook OAuth Strategy (temporarily disabled)
// passport.use(
//   new FacebookStrategy(
//     {
//       clientID: config.OAUTH.FACEBOOK.APP_ID,
//       clientSecret: config.OAUTH.FACEBOOK.APP_SECRET,
//       callbackURL: "/api/auth/facebook/callback",
//       profileFields: ["id", "displayName", "photos", "email"],
//     },
//     async (accessToken, refreshToken, profile, done) => {
//       try {
//         let user = await User.findOne({ email: profile.emails[0].value });
//         if (!user) {
//           user = await User.create({
//             name: profile.displayName,
//             email: profile.emails[0].value,
//             password: Math.random().toString(36),
//             avatar: profile.photos[0]?.value || "",
//           });
//         }
//         return done(null, user);
//       } catch (err) {
//         return done(err, null);
//       }
//     }
//   )
// );

module.exports = passport;
