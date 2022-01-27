const express = require('express')
const router = express.Router()

module.exports = () => {
  const signUpRouter = new SignUpRouter()
  router.post('/signup', ExpressRouterAdapter.adapt(signUpRouter))
}

class ExpressRouterAdapter {
  static adapt (router) {
    return async (req, res) => {
      const httpRequest = {
        body: req.body
      }
      const httpResponse = await router.route(httpRequest)
      res.status(httpResponse.statusCode).json(httpResponse.body)
    }
  }
}

// Presentation Layer
class SignUpRouter {
  async route (httpRequest) {
    const { email, password, repeatPassword } = httpRequest.body
    const user = new SignUpUseCase().check(email, password, repeatPassword)
    return {
      statusCode: 201,
      body: user
    }
  }
}

// Domain Layer
class SignUpUseCase {
  async check (email, password, repeatPassword) {
    if (password === repeatPassword) {
      new AccountRepository().add(email, password)
    }
  }
}

// Infra Layer
const mongoose = require('mongoose')
const AccountModel = mongoose.model('Account')
class AccountRepository {
  async add (email, password) {
    const user = await AccountModel.create({ email, password })
    return user
  }
}
