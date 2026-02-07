const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const dynamoService = require('../utils/dynamoService');
const { v4: uuidv4 } = require('uuid');

// Serialize user to session
passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
    try {
        const user = await dynamoService.findUserByEmail(email);
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/auth/google/callback`,
    passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
    const callbackUrl = `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/auth/google/callback`;
    console.log(`🔹 Google Strategy Initialized with Callback URL: ${callbackUrl}`);
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
            return done(new Error('No email found in Google profile'), null);
        }

        // Check if user exists by email
        let user = await dynamoService.findUserByEmail(email);

        if (user) {
            // User exists, return them
            // Optionally update googleId here if we added that field to Dynamo schema
            return done(null, user);
        }

        // Create new user if not exists
        // Note: We need a dummy password since our service might expect one, 
        // or we trust that social users won't use password login unless they set one later.
        user = await dynamoService.createUser({
            firstName: profile.name.givenName || 'Google User',
            lastName: profile.name.familyName || '',
            email: email,
            phone: '0000000000', // Placeholder as phone is often required
            password: uuidv4(), // Dummy secure password for social login users
            role: 'customer',
            isVerified: true
        });

        done(null, user);
    } catch (error) {
        console.error('Passport Google Strategy Error:', error);
        done(error, null);
    }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID || 'dummy_app_id',
    clientSecret: process.env.FACEBOOK_APP_SECRET || 'dummy_app_secret',
    callbackURL: `${process.env.BACKEND_URL || 'http://localhost:8000'}/api/auth/facebook/callback`,
    profileFields: ['id', 'emails', 'name']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

        if (!email) {
            // Facebook might not return email if not verified or granted
            // For now, we can't create a user without email in our specific DynamoDB schema (PK = email)
            return done(new Error('No email found in Facebook profile'), null);
        }

        let user = await dynamoService.findUserByEmail(email);

        if (user) {
            return done(null, user);
        }

        user = await dynamoService.createUser({
            firstName: profile.name.givenName || 'Facebook User',
            lastName: profile.name.familyName || '',
            email: email,
            phone: '0000000000',
            password: uuidv4(),
            role: 'customer',
            isVerified: true
        });

        done(null, user);
    } catch (error) {
        console.error('Passport Facebook Strategy Error:', error);
        done(error, null);
    }
}));

module.exports = passport;
