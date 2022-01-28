class LoginRouter {
  route (httpRequest) {
    if (!httpRequest || !httpRequest.body) {
      return HttpResponse.serverError()
    }
    const { email, password } = httpRequest.body
    if (!email) {
      return HttpResponse.badRequest('email')
    }
    if (!password) {
      return HttpResponse.badRequest('password')
    }
  }
}

class MissingParamError extends Error {
  constructor (paramName) {
    super(`Missing param: ${paramName}`)
    this.name = 'MissgingParamError'
  }
}

class HttpResponse {
  static badRequest (paramName) {
    return {
      statusCode: 400,
      body: new MissingParamError(paramName)
    }
  }

  static serverError () {
    return {
      statusCode: 500
    }
  }
}

describe('Login Router', () => {
  test('should return 400 if no email is provided', () => {
    // sut, acronym for system under test
    const sut = new LoginRouter()
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
    const sut = new LoginRouter()
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
    const sut = new LoginRouter()
    const httpResponse = sut.route()
    expect(httpResponse.statusCode).toBe(500)
  })

  test('should return 500 if no httpRequest has no body', () => {
    // sut, acronym for system under test
    const sut = new LoginRouter()
    const httpRequest = {}
    const httpResponse = sut.route(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
  })
})
