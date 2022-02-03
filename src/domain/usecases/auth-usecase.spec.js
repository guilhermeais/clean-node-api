const { MissingParamError } = require('../../utils/errors')
class AuthUseCase {
  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }
  }
}

describe('Auth UseCase', () => {
  test('should throws if no email is provided', async () => {
    const sut = new AuthUseCase()
    const sutPromise = sut.auth()
    expect(sutPromise).rejects.toThrow(new MissingParamError('email'))
  })
})
