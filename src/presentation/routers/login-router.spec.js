const {
  MissingParamError,
  InvalidParamError,
  UnauthorizedError,
  ServerError
} = require('../errors')

const LoginRouter = require('./login-router')

const makeSut = () => {
  const authUseCaseSpy = makeAuthUseCase()

  const emailValidatorSpy = makeEmailValidator()
  const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
  return {
    sut,
    authUseCaseSpy,
    emailValidatorSpy
  }
}

const makeEmailValidator = () => {
  class EmailValidatorSpy {
    isValid (email) {
      this.email = email
      return this.isEmailValid
    }
  }
  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

const makeEmailValidatorWithError = () => {
  class EmailValidatorSpy {
    isValid () {
      throw new Error()
    }
  }
  const emailValidatorSpy = new EmailValidatorSpy()
  emailValidatorSpy.isEmailValid = true
  return emailValidatorSpy
}

const makeAuthUseCase = () => {
  /**
   * This AuthUseCaseSpy, it's just a mock to test LoginRouter.
   *  This is just a mock to inject dependency of an AuthUseCase at LoginRouter and spy the values that the real implementation would receive.
   */
  class AuthUseCaseSpy {
    async auth (email, password) {
      this.email = email
      this.password = password
      return this.accessToken
    }
  }
  const authUseCaseSpy = new AuthUseCaseSpy()
  authUseCaseSpy.accessToken = 'any_valid_token'
  return authUseCaseSpy
}

const makeAuthUseCaseWithError = () => {
  class AuthUseCaseSpy {
    async auth () {
      throw new Error(
        'just for ensure that login router return 500 if AuthUseCase throws a error'
      )
    }
  }
  return new AuthUseCaseSpy()
}

describe('Login Router', () => {
  test('should return 400 if no email is provided', async () => {
    // sut, acronym for system under test
    const sut = makeSut().sut
    const httpRequest = {
      body: {
        password: 'anyPass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })
  test('should return 400 if no password is provided', async () => {
    // sut, acronym for system under test
    const sut = makeSut().sut
    const httpRequest = {
      body: {
        email: 'someemail'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 500 if no httpRequest provided', async () => {
    // sut, acronym for system under test
    const sut = makeSut().sut
    const httpResponse = await sut.route()
    expect(httpResponse.statusCode)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if httpRequest has no body', async () => {
    // sut, acronym for system under test
    const sut = makeSut().sut
    const httpRequest = {}
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should call authUseCase with correct params', async () => {
    // sut, acronym for system under test
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'someemail',
        password: 'somepass'
      }
    }
    await sut.route(httpRequest)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  test('should return 401 when invalid credentials are provided', async () => {
    // sut, acronym for system under test
    const { sut, authUseCaseSpy } = makeSut()
    authUseCaseSpy.accessToken = null
    const httpRequest = {
      body: {
        email: 'some_invalid_email@gmail.com',
        password: 'some_invalid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError('password'))
  })

  test('should return 500 if no AuthUseCase is provided', async () => {
    // sut, acronym for system under test
    const sut = new LoginRouter()
    const httpRequest = {
      body: {
        email: 'some_invalid_email@gmail.com',
        password: 'some_invalid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
  test('should return 500 if AuthUseCase has auth method', async () => {
    class AuthUseCaseSpyWithoutAuthMethod {}

    const authUseCaseSpyWithoutAuthMethod = new AuthUseCaseSpyWithoutAuthMethod()

    // sut, acronym for system under test
    const sut = new LoginRouter(authUseCaseSpyWithoutAuthMethod)
    const httpRequest = {
      body: {
        email: 'some_invalid_email@gmail.com',
        password: 'some_invalid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 200 when valid credentials are providaded', async () => {
    // sut, acronym for system under test
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'some_valid_email@gmail.com',
        password: 'some_valid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect(httpResponse.body.accessToken).toEqual(authUseCaseSpy.accessToken)
  })

  test('should return 500 if AuthUseCase throws', async () => {
    const authUseCaseSpy = makeAuthUseCaseWithError()
    authUseCaseSpy.accessToken = 'any_valid_token'
    const sut = new LoginRouter(authUseCaseSpy)
    const httpRequest = {
      body: {
        email: 'some_invalid_email@gmail.com',
        password: 'some_invalid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })
  test('should return 400 if invalid email is provided', async () => {
    // sut, acronym for system under test
    const { sut, emailValidatorSpy } = makeSut()
    emailValidatorSpy.isEmailValid = false
    const httpRequest = {
      body: {
        email: 'invalid_email@mail.com',
        password: 'any_valid_password'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new InvalidParamError('email'))
  })

  test('should return 500 if no EmailValidator is provided', async () => {
    // sut, acronym for system under test
    const authUseCaseSpy = makeAuthUseCase()

    const sut = new LoginRouter(authUseCaseSpy)

    const httpResponse = await sut.route()
    expect(httpResponse.statusCode)
    expect(httpResponse.body).toEqual(new ServerError())
  })
  test('should return 500 if EmailValidator has no isValid method', async () => {
    // sut, acronym for system under test
    const authUseCaseSpy = makeAuthUseCase()

    const sut = new LoginRouter(authUseCaseSpy, {})

    const httpResponse = await sut.route()
    expect(httpResponse.statusCode)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should return 500 if EmailValidator throws', async () => {
    const authUseCaseSpy = makeAuthUseCase()
    const emailValidatorSpy = makeEmailValidatorWithError()

    authUseCaseSpy.accessToken = 'any_valid_token'
    const sut = new LoginRouter(authUseCaseSpy, emailValidatorSpy)
    const httpRequest = {
      body: {
        email: 'some_invalid_email@gmail.com',
        password: 'some_invalid_pass'
      }
    }
    const httpResponse = await sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toEqual(new ServerError())
  })

  test('should call EmailValidator with correct emaiil', async () => {
    // sut, acronym for system under test
    const { sut, emailValidatorSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'someemail@gmail.com',
        password: 'somepass'
      }
    }
    await sut.route(httpRequest)
    expect(emailValidatorSpy.email).toBe(httpRequest.body.email)
  })
})
