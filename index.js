const USERS = [{id: 1, name: 'Foo'}, {id: 2, name: 'Bar'}]

let _ = require('lodash')
let path = require('path')
let createError = require('http-errors')

let express = require('express')
let app = express()

let helmet = require('helmet')
app.use(helmet())
let morgan = require('morgan')
app.use(morgan('combined'))
let cors = require('cors')
app.use(cors())

let v1 = express.Router()

v1
.route('/users')
.get((req, res, next) => {
  res.json(USERS)
})

v1
.route('/users/:userId')
.all((req, res, next) => {
	req.userId = +req.params.userId
	if (!req.userId || !_.isInteger(req.userId)) {
		let err = createError(400, 'Invalid userId')
		return next(err)
	}
	next()
})
.get((req, res, next) => {
  const user = USERS.find((u) => {
    return u.id === req.userId
  })
  if (!user) {
    let err = createError(404, 'User not found')
    return next(err)
  }
  res.json(user)
})

app.use('/v1', v1)

app.use(express.static(path.join(__dirname, 'public')))

app.use((err, req, res, next) => {
  if (err) {
    return res
    .status(err.code || err.status || 500)
    .json({message: err.message || 'Internal server error'})
  }
  next()
})

exports.api = (req, res) => {
  app(req, res)
}
