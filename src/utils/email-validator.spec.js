const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

const makeSut = () => {
  return new EmailValidator()
}

describe('Email Validator', () => {
  test('should return true if validator returns true', () => {
    const sut = makeSut()
    const isEmailValid = sut.isValid('some_valid_email@gmail.com')
    expect(isEmailValid).toBe(true)
  })
  test('should return false if validator returns false', () => {
    validator.isEmailValid = false
    const sut = makeSut()
    const isEmailValid = sut.isValid('some_invalid_email@gmail.com')
    expect(isEmailValid).toBe(false)
  })
  test('should call validator with correct email', () => {
    const sut = makeSut()
    const mockEmail = 'any_email'
    sut.isValid(mockEmail)
    expect(validator.email).toBe(mockEmail)
  })
})
