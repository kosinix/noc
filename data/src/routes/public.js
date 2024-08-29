//// Core modules
let { timingSafeEqual } = require('crypto')
const url = require('url');

//// External modules
const express = require('express')
const flash = require('kisapmata')
const lodash = require('lodash')
const moment = require('moment')

//// Modules
// const mailer = require('../mailer')
const passwordMan = require('../password-man')

// Router
let router = express.Router()

router.get('/', async (req, res, next) => {
    try {

        res.render('home.html', {});
    } catch (err) {
        next(err);
    }
});

router.get('/login', async (req, res, next) => {
    try {
        if (lodash.get(req, 'session.authUserId')) {
            return res.redirect(`/`)
        }
        // console.log(req.session)
        let ip = req.headers['x-real-ip'] || req.connection.remoteAddress;
        res.render('login.html', {
            flash: flash.get(req, 'login'),
            ip: ip,
            username: lodash.get(req, 'query.username', ''),
        });
    } catch (err) {
        next(err);
    }
});
router.post('/login', async (req, res, next) => {
    try {
        if (CONFIG.loginDelay > 0) {
            await new Promise(resolve => setTimeout(resolve, CONFIG.loginDelay)) // Rate limit 
        }

        let post = req.body;
        let user = null


        let username = lodash.get(post, 'username', '');
        let password = lodash.trim(lodash.get(post, 'password', ''))

        // Find admin
        user = await req.app.locals.db.models.User.findOne({ where: { username: username } })
        if (!user) {
            throw new Error('Incorrect username.')
        }

        // Check password
        let passwordHash = passwordMan.hashPassword(password, user.salt);
        if (!timingSafeEqual(Buffer.from(passwordHash, 'utf8'), Buffer.from(user.passwordHash, 'utf8'))) {
            throw new Error('Incorrect password.');
        }

        if (!user.active) {
            throw new Error('Your account is deactivated.');
        }

        // Save user id to session
        lodash.set(req, 'session.authUserId', user.id);

        // Security: Anti-CSRF token.
        let antiCsrfToken = await passwordMan.randomStringAsync(16)
        lodash.set(req, 'session.acsrf', antiCsrfToken);

        return res.redirect('/admin');
    } catch (err) {
        console.error(err)
        flash.error(req, 'login', err.message);
        return res.redirect('/login');
    }
});

router.get('/logout', async (req, res, next) => {
    try {
        lodash.set(req, 'session.authUserId', null);
        lodash.set(req, 'session.acsrf', null);
        lodash.set(req, 'session.flash', null);
        res.clearCookie(CONFIG.session.name, CONFIG.session.cookie);

        res.redirect('/login');
    } catch (err) {
        next(err);
    }
});



module.exports = router;