const LoginRouter = require('./login-router')
const MissingParamError = require('../helpers/missing-param-error')
const UnauthorizedError = require('../helpers/unauthorized-error')

const makeSut = () => {
  /*
   this AuthUseCaseSpy, it's just a mock to test LoginnRouter.
   This is just a mock to inject dependency of an AuthUseCase at LoginRouter and spy the values
   that the real implementation would receive.
   */
  class AuthUseCaseSpy {
    auth (email, password) {
      this.email = email
      this.password = password
    }
  }

  const authUseCaseSpy = new AuthUseCaseSpy()
  const sut = new LoginRouter(authUseCaseSpy)
  return {
    sut,
    authUseCaseSpy
  }
}

describe('Login Router', () => {
  test('should return 400 if no email is provided', () => {
    // sut, acronym for system under test
    const sut = makeSut().sut
    const httpRequest = {
      body: {
        password: 'anyPass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('email'))
  })
  test('should return 400 if no password is provided', () => {
    // sut, acronym for system under test
    const sut = makeSut().sut
    const httpRequest = {
      body: {
        email: 'someemail'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('password'))
  })

  test('should return 500 if no httpRequest provided', () => {
    // sut, acronym for system under test
    const sut = makeSut().sut
    const httpResponse = sut.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if httpRequest has no body', () => {
    // sut, acronym for system under test
    const sut = makeSut().sut
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should call authUseCase with correct params', () => {
    // sut, acronym for system under test
    const { sut, authUseCaseSpy } = makeSut()
    const httpRequest = {
      body: {
        email: 'someemail',
        password: 'somepass'
      }
    }
    sut.route(httpRequest)
    expect(authUseCaseSpy.email).toBe(httpRequest.body.email)
    expect(authUseCaseSpy.password).toBe(httpRequest.body.password)
  })

  test('should return 401 when invalid credentials are provided', () => {
    // sut, acronym for system under test
    const { sut } = makeSut()
    const httpRequest = {
      body: {
        email: 'some_invalid_email@gmail.com',
        password: 'some_invalid_pass'
      }
    }
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(401)
    expect(httpResponse.body).toEqual(new UnauthorizedError('password'))
  })
})
