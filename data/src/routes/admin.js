//// Core modules

//// External modules
const express = require('express')
const lodash = require('lodash')
const moment = require('moment')
const flash = require('kisapmata')
const { Sequelize } = require('sequelize')
const qr = require('qr-image')
const sharp = require('sharp')

//// Core modules

//// Modules
const passwordMan = require('../password-man')
const middlewares = require('../middlewares')
const googleAdmin = require('../google-admin')

// Router
let router = express.Router()

router.use('/admin', middlewares.requireAdminUser)

router.get(['/admin', '/admin/all'], async (req, res, next) => {
    try {
        res.redirect('/admin/calendar/all')
    } catch (err) {
        next(err);
    }
});

module.exports = router;