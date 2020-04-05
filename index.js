const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const app = express()

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }))
app.use(bodyParser.json())
app.use(cookieParser())

const jwt = require('jsonwebtoken')

const jwtKey = 'my_secret_key'
const jwtExpirySeconds = 300

const user = {
  email: 'admin@admin.com',
  password: 'passwordpassword'
}

app.get('/status', (req, res) => {
  res.json({
    status: 'Online'
  })
})

app.post('/login', (req, res) => {
  const { email, password } = req.body

  // Account Validation
  if (
    !email ||
    !password ||
    user.password !== password ||
    user.email !== email
  ) {
    return res.status(401).end()
  }

  const token = jwt.sign({ email }, jwtKey, {
    algorithm: 'HS256',
    expiresIn: jwtExpirySeconds
  })

  res.cookie('token', token, { maxAge: jwtExpirySeconds * 1000 })
  res.end()
})

app.post('/validate', (req, res) => {
  const token = req.cookies.token

  // if the cookie is not set, return an unauthorized error
  if (!token) {
    return res.status(401).end()
  }

  let payload
  try {
    payload = jwt.verify(token, jwtKey)
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      // Bad Token
      return res.status(401).end()
    }
    // Error
    return res.status(400).end()
  }

  // Implement Checking to See if We have Token
  res.send(payload.email)
})

app.listen(8001, () => {
  console.log('Server running on port: 8001')
})
