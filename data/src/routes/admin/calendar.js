//// Core modules

//// External modules
const express = require('express')
const lodash = require('lodash')
const moment = require('moment')
const flash = require('kisapmata')
const kalendaryo = require('kalendaryo')
const { Sequelize } = require('sequelize')

//// Core modules

//// Modules
const passwordMan = require('../../password-man')
const middlewares = require('../../middlewares')

// Router
let router = express.Router()

router.use('/admin/calendar', middlewares.requireAdminUser)

//// GSU ID
router.get('/admin/calendar/all', async (req, res, next) => {
    try {
        let momentDate = (req.query?.date) ? moment(req.query?.date) : moment().startOf('month')
        let s = (req.query?.s) ? `${req.query?.s}`.trim() : ''
        let where = {}

        let mNow = moment()
        let mFirstDay = momentDate.clone().startOf('month')
        let mLastDay = momentDate.clone().endOf('month')
        let matrix = kalendaryo.getMatrix(momentDate, 0)
        // let attendances = kalendaryo.getDays(momentDate, 0)

        where = lodash.set(where, 'dueAt', {
            [Sequelize.Op.gte]: mFirstDay.toDate(),
            [Sequelize.Op.lte]: mLastDay.toDate(),
        })

        let tasks = await req.app.locals.db.models.Task.findAll({
            where: where,
            order: [
                ['status', 'ASC'],
                ['createdAt', 'ASC'],
            ],
            raw: true
        })

        tasks = tasks.map(t => {
            t.dueAt = moment(t.dueAt).format('YYYY-MM-DD')
            return t
        })
        tasks = lodash.groupBy(tasks, (t) => {
            return t.dueAt
        })
        // return res.send(tasks)

        matrix = matrix.map((row, i) => {
            row = row.map((cell) => {
                let mCellDate = moment(cell, 'YYYY-MM-DD', true)
                let className = 'bg-white'
                if (mCellDate.isBefore(mFirstDay)) {
                    // cell = ''
                } else if (mCellDate.isAfter(mLastDay)) {
                    // cell = ''

                } else if (mCellDate.isSame(mNow, 'day')) {
                    className = 'bg-warning text-light'
                }
                if (i === 0 && ['Sun', 'Sat'].includes(cell)) {
                    className = 'text-danger'
                }
                if (['Sun', 'Sat'].includes(mCellDate.format('ddd'))) {
                    className = 'text-danger'
                }

                return {
                    value: cell,
                    tasks: tasks[cell],
                    classes: className,
                }
            })
            return row
        })

        let months = Array.from(Array(12).keys()).map((e, i) => {
            return momentDate.clone().month(i).startOf('month')
        }); // 1-count

        let years = []
        for (let y = parseInt(moment().format('YYYY')); y > 1999; y--) {
            years.push(y)
        }

        // return res.send(matrix)
        // console.log(where)

        let data = {
            momentDate: momentDate,
            matrix: matrix,
            prevDate: momentDate.clone().subtract(1, 'month').startOf('month'),
            nextDate: momentDate.clone().add(1, 'month').startOf('month'),
            s: s,
            flash: flash.get(req, 'calendar')
        }
        res.render('admin/calendar/all.html', data);
    } catch (err) {
        next(err);
    }
});

router.get('/admin/calendar/view/:date', middlewares.getDate(), async (req, res, next) => {
    try {
        let momentDate = res.momentDate.clone()

        let data = {
            flash: flash.get(req, 'calendar', `Calendar.`),
            date: momentDate.clone(),
        }

        res.redirect(`/admin/calendar/view/${momentDate.format('YYYY-MM-DD')}/task/all`)
        // res.render(`admin/calendar/view.html`, data)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/calendar/view/:date/task/all', middlewares.getDate(), async (req, res, next) => {
    try {
        let momentDate = res.momentDate

        let where = {}
        where = lodash.set(where, 'dueAt', {
            [Sequelize.Op.gte]: momentDate.clone().startOf('day').toDate(),
            [Sequelize.Op.lte]: momentDate.clone().endOf('day').toDate(),
        })
        let tasks = await req.app.locals.db.models.Task.findAll({
            where: where,
            raw: true
        })
        let data = {
            flash: flash.get(req, 'calendar'),
            date: momentDate.clone(),
            tasks: tasks,
            tasksPending: tasks.filter(t => t.status === 1),
            tasksDoing: tasks.filter(t => t.status === 2),
            tasksDone: tasks.filter(t => t.status === 3),
        }

        res.render(`admin/calendar/task/all.html`, data)
    } catch (err) {
        next(err);
    }
});
router.get('/admin/calendar/view/:date/task/create', middlewares.getDate(), async (req, res, next) => {
    try {
        let momentDate = res.momentDate

        let data = {
            flash: flash.get(req, 'calendar', `Calendar.`),
            date: momentDate.clone(),
        }

        res.render(`admin/calendar/task/create.html`, data)
    } catch (err) {
        next(err);
    }
});
router.post('/admin/calendar/view/:date/task/create', middlewares.getDate(), async (req, res, next) => {
    try {
        let momentDate = res.momentDate

        let post = req.body

        await req.app.locals.db.models.Task.create({
            uid: passwordMan.genPasscode(),
            name: post.name,
            description: (post.description) ? post.description : null,
            status: (post.status) ? post.status : null,
            dueAt: (post.dueAt) ? moment(post.dueAt).toDate() : null,
        })

        flash.ok(req, 'calendar', `Task created.`)
        res.redirect(`/admin/calendar/view/${momentDate.format('YYYY-MM-DD')}/task/all`)
    } catch (err) {
        next(err);
    }
});

// Delete
router.get('/admin/calendar/view/:date/task/delete/:taskId', middlewares.getDate(), middlewares.getTask({ raw: false }), async (req, res, next) => {
    try {
        let momentDate = res.momentDate

        let id = res.task.id
        await res.task.destroy()

        flash.ok(req, 'calendar', `Task ID ${id} deleted.`)
        res.redirect(`/admin/calendar/view/${momentDate.format('YYYY-MM-DD')}/task/all`)
    } catch (err) {
        next(err);
    }
});

router.get('/admin/calendar/view/:date/task/status/:taskId/:status', middlewares.getDate(), middlewares.getTask({ raw: false }), async (req, res, next) => {
    try {
        let momentDate = res.momentDate

        let id = res.task.id
        res.task.status = req.params.status
        await res.task.save()

        flash.ok(req, 'calendar', `Task ID ${id} updated.`)
        res.redirect(`/admin/calendar/view/${momentDate.format('YYYY-MM-DD')}/task/all`)
    } catch (err) {
        next(err);
    }
});

module.exports = router;