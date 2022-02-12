const { MissingParamError, InvalidParamError } = require('../../utils/errors')

module.exports = class AuthUseCase {
  _dependenciesValidator () {
    if (!this.loadUserByEmailRepository) {
      throw new MissingParamError('loadUserByEmailRepository')
    }
    if (!this.loadUserByEmailRepository.load) {
      throw new InvalidParamError('loadUserByEmailRepository')
    }

    if (!this.encrypter) {
      throw new MissingParamError('encrypter')
    }
    if (!this.encrypter.compare) {
      throw new InvalidParamError('encrypter')
    }

    if (!this.tokenGenerator) {
      throw new MissingParamError('tokenGenerator')
    }
    if (!this.tokenGenerator.generate) {
      throw new InvalidParamError('tokenGenerator')
    }
  }

  constructor ({ loadUserByEmailRepository, encrypter, tokenGenerator } = {}) {
    this.loadUserByEmailRepository = loadUserByEmailRepository
    this.encrypter = encrypter
    this.tokenGenerator = tokenGenerator
  }

  async auth (email, password) {
    if (!email) {
      throw new MissingParamError('email')
    }

    if (!password) {
      throw new MissingParamError('password')
    }
    this._dependenciesValidator()

    const user = await this.loadUserByEmailRepository.load(email)
    if (user) {
      const isValid = await this.encrypter.compare(password, user.password)
      if (!isValid) {
        return null
      }
      return await this.tokenGenerator.generate(user.id)
    }
    return null
  }
}
