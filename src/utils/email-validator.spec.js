const validator = require('validator')

class EmailValidator {
  isValid (email) {
    return validator.isEmail(email)
  }
}

describe('Email Validator', () => {
  test('should return true if validator returns true', () => {
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('some_valid_email@gmail.com')
    expect(isEmailValid).toBe(true)
  })
  test('should return false if validator returns false', () => {
    validator.isEmailValid = false
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('some_invalid_email@gmail.com')
    expect(isEmailValid).toBe(false)
  })
})
