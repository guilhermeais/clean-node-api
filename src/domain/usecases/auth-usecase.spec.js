const { MissingParamError } = require('../../utils/errors')
class AuthUseCase {
  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }

    if (!password) {
      throw new MissingParamError('password')
    }
  }
}

describe('Auth UseCase', () => {
  test('should throws if no email is provided', async () => {
    const sut = new AuthUseCase()
    const sutPromise = sut.auth()
    expect(sutPromise).rejects.toThrow(new MissingParamError('email'))
  })
  test('should throws if no password is provided', async () => {
    const sut = new AuthUseCase()
    const sutPromise = sut.auth('any_email@gmail.com')
    expect(sutPromise).rejects.toThrow(new MissingParamError('password'))
  })
})
