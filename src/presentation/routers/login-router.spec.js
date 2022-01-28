class LoginRouter {
  route (httpRequest) {
    const { email, password } = httpRequest.body
    if (email && password) {
      return
    }
    return {
      statusCode: 400
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
  })
})
