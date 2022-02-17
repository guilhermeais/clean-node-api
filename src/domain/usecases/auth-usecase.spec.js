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

const makeEncrypterWithError = () => {
  class EncrypterSpy {
    async compare (password, hashedPassword) {
      throw new Error()
    }
  }
  const encrypterSpy = new EncrypterSpy()

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
    id: 'any_id',
    password: 'hashed_password'
  }
  return loadUserByEmailRepositorySpy
}
const makeLoadUserByEmailRepositoryWithError = () => {
  class LoadUserByEmailRepository {
    async load () {
      throw new Error()
    }
  }

  return new LoadUserByEmailRepository()
}

const makeTokenGenerator = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      this.userId = userId
      return this.accessToken
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()
  tokenGeneratorSpy.accessToken = 'any_token'
  return tokenGeneratorSpy
}

const makeTokenGeneratorWithError = () => {
  class TokenGeneratorSpy {
    async generate (userId) {
      throw new Error()
    }
  }
  const tokenGeneratorSpy = new TokenGeneratorSpy()

  return tokenGeneratorSpy
}
const makeUpdateAccessTokenRepository = () => {
  class UpdateAccessTokenRepositorySpy {
    async update (userId, accessToken) {
      this.userId = userId
      this.accessToken = accessToken
    }
  }
  const updateAccessTokenRepositorySpy = new UpdateAccessTokenRepositorySpy()

  return updateAccessTokenRepositorySpy
}

const makeUpdateAccessTokenRepositoryWithError = () => {
  class UpdateAccessTokenRepositorySpy {
    async update (userId, accessToken) {
      throw new Error()
    }
  }
  const updateAccessTokenRepositorySpy = new UpdateAccessTokenRepositorySpy()

  return updateAccessTokenRepositorySpy
}

const makeSut = () => {
  const encrypterSpy = makeEncrypter()
  const loadUserByEmailRepositorySpy = makeLoadUserByEmailRepository()
  const tokenGeneratorSpy = makeTokenGenerator()
  const updateAccessTokenRepositorySpy = makeUpdateAccessTokenRepository()
  const sut = new AuthUseCase({
    loadUserByEmailRepository: loadUserByEmailRepositorySpy,
    encrypter: encrypterSpy,
    tokenGenerator: tokenGeneratorSpy,
    updateAccessTokenRepository: updateAccessTokenRepositorySpy
  })

  return {
    sut,
    loadUserByEmailRepositorySpy,
    encrypterSpy,
    tokenGeneratorSpy,
    updateAccessTokenRepositorySpy
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
  test('should call TokenGenerator with correct userId', async () => {
    const { sut, loadUserByEmailRepositorySpy, tokenGeneratorSpy } = makeSut()

    await sut.auth('valid_email@gmail.com', 'valid_password')

    expect(tokenGeneratorSpy.userId).toBe(loadUserByEmailRepositorySpy.user.id)
  })
  test('should return an accessToken if correct credentials are provided', async () => {
    const { sut, tokenGeneratorSpy } = makeSut()

    const accessToken = await sut.auth(
      'valid_email@gmail.com',
      'valid_password'
    )

    expect(tokenGeneratorSpy.accessToken).toBe(accessToken)
    expect(tokenGeneratorSpy.accessToken).toBeTruthy()
  })

  test('should throws if no dependencies is provided', async () => {
    const sut = new AuthUseCase()
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow()
  })
  test('should throws if no LoadUserByEmailRepository is provided', async () => {
    const sut = new AuthUseCase({ loadUserByEmailRepository: undefined })
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(
      new MissingParamError('loadUserByEmailRepository')
    )
  })
  test('should throws if  LoadUserByEmailRepository has no load method', async () => {
    const sut = new AuthUseCase({
      loadUserByEmailRepository: {},
      encrypter: undefined,
      tokenGenerator: makeTokenGenerator()
    })
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(
      new InvalidParamError('loadUserByEmailRepository')
    )
  })

  test('should throws if no Encrypter is provided', async () => {
    const sut = new AuthUseCase({
      encrypter: undefined,
      loadUserByEmailRepository: makeLoadUserByEmailRepository(),
      tokenGenerator: makeTokenGenerator()
    })
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(new MissingParamError('encrypter'))
  })
  test('should throws if Encrypter has no compare method', async () => {
    const sut = new AuthUseCase({
      encrypter: {},
      loadUserByEmailRepository: makeLoadUserByEmailRepository(),
      tokenGenerator: makeTokenGenerator()
    })
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(new InvalidParamError('encrypter'))
  })

  test('should throws if no TokenGenerator is provided', async () => {
    const sut = new AuthUseCase({
      tokenGenerator: undefined,
      encrypter: makeEncrypter(),
      loadUserByEmailRepository: makeLoadUserByEmailRepository()
    })
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(new MissingParamError('tokenGenerator'))
  })
  test('should throws if TokenGenerator has no compare method', async () => {
    const sut = new AuthUseCase({
      tokenGenerator: {},
      encrypter: makeEncrypter(),
      loadUserByEmailRepository: makeLoadUserByEmailRepository()
    })
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(new InvalidParamError('tokenGenerator'))
  })
  test('should throws if no UpdateAccessTokenRepository is provided', async () => {
    const sut = new AuthUseCase({
      tokenGenerator: makeTokenGenerator(),
      encrypter: makeEncrypter(),
      loadUserByEmailRepository: makeLoadUserByEmailRepository(),
      UpdateAccessTokenRepository: undefined
    })
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(
      new MissingParamError('updateAccessTokenRepository')
    )
  })
  test('should throws if UpdateAccessTokenRepository has no update method', async () => {
    const sut = new AuthUseCase({
      tokenGenerator: makeTokenGenerator(),
      encrypter: makeEncrypter(),
      loadUserByEmailRepository: makeLoadUserByEmailRepository(),
      updateAccessTokenRepository: {}
    })
    const sutPromise = sut.auth('any_email@gmail.com', 'any_password')

    expect(sutPromise).rejects.toThrow(
      new InvalidParamError('updateAccessTokenRepository')
    )
  })

  test('should throw if any dependency throws', async () => {
    const loadUserByEmailRepository = makeLoadUserByEmailRepository()
    const encrypter = makeEncrypter()
    const tokenGenerator = makeTokenGenerator()
    const suts = [
      new AuthUseCase({
        loadUserByEmailRepository: makeLoadUserByEmailRepositoryWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter: makeEncrypterWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator: makeTokenGeneratorWithError()
      }),
      new AuthUseCase({
        loadUserByEmailRepository,
        encrypter,
        tokenGenerator,
        updateAccessTokenRepository: makeUpdateAccessTokenRepositoryWithError()
      })
    ]
    for (const sut of suts) {
      const promise = sut.auth('any_email@mail.com', 'any_password')
      expect(promise).rejects.toThrow()
    }
  })

  test('should call UpdateAccessTokenRepository with correct values', async () => {
    const {
      sut,
      loadUserByEmailRepositorySpy,
      updateAccessTokenRepositorySpy,
      tokenGeneratorSpy
    } = makeSut()

    await sut.auth('valid_email@gmail.com', 'valid_password')

    expect(updateAccessTokenRepositorySpy.userId).toBe(
      loadUserByEmailRepositorySpy.user.id
    )
    expect(updateAccessTokenRepositorySpy.accessToken).toBe(
      tokenGeneratorSpy.accessToken
    )
  })
})
