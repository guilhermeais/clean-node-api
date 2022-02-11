const { MissingParamError, InvalidParamError } = require('../../utils/errors')
const AuthUseCase = require('./auth-usecase')

const makeEncrypter = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      this.password = password
      this.hashedPassword = hashedPassword
      return this.isValid
    }
  }
  const encrypterSpy = new EncrypterSpy()
  encrypterSpy.isValid = true
  return encrypterSpy
}

const makeLoadUserByEmailRepository = () => {
  class LoadUserByEmailRepository {
    async load (email) {
      this.email = email
      return this.user
    }
  }
  const loadUserByEmailRepositorySpy = new LoadUserByEmailRepository()
  loadUserByEmailRepositorySpy.user = {
    password: 'hashed_password'
  }
  return loadUserByEmailRepositorySpy
}

const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const sut = new AuthUseCase(loadUserByEmailRepositorySpy, encrypterSpy)

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy
  }
}

describe('Auth UseCase', () => {
  test('should throws if no email is provided', async () => {
    const { sut } = makeSut()
    const sutPromise = sut.auth()
    expect(sutPromise).rejects.toThrow(new MissingParamError('email'))
  })
  test('should throws if no password is provided', async () => {
    const { sut } = makeSut()
    const sutPromise = sut.auth('any_email@gmail.com')
    expect(sutPromise).rejects.toThrow(new MissingParamError('password'))
  })
  test('should call LoadUserByEmailRepository with correct email', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    await sut.auth('any_email@gmail.com', 'any_password')
    expect(loadUserByEmailRepositorySpy.email).toBe('any_email@gmail.com')
  })
  test('should throws if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase()
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(
      new MissingParamError('loadUserByEmailRepository')
    )
  })
  test('should throws if  LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({})
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(
      new InvalidParamError('loadUserByEmailRepository')
    )
  })
  test('should return null if invalid email is provided', async () => {
    const { sut, loadUserByEmailRepositorySpy } = makeSut()
    loadUserByEmailRepositorySpy.user = null
    const accessToken = await sut.auth(
      'invalid_email@gmail.com',
      'any_password'
    )

    expect(accessToken).toBeNull()
  })
  test('should return null if invalid password is provided', async () => {
    const { sut, encrypterSpy } = makeSut()
    encrypterSpy.isValid = false
    const accessToken = await sut.auth(
      'valid_email@gmail.com',
      'invalid_password'
    )

    expect(accessToken).toBeNull()
  })
  test('should call Encrypter with correct values', async () => {
    const { sut, loadUserByEmailRepositorySpy, encrypterSpy } = makeSut()
    const anyPassword = 'anyPassword'
    const hashedPassword = loadUserByEmailRepositorySpy.user.password

    await sut.auth('valid_email@gmail.com', anyPassword)

    expect(encrypterSpy.password).toBe(anyPassword)
    expect(encrypterSpy.hashedPassword).toBe(hashedPassword)
  })
})
