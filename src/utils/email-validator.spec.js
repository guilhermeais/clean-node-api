class EmailValidator {
  isValid (email) {
    return true
  }
}

describe('Email Validator', () => {
  test('should return true if validator returns true', () => {
    const sut = new EmailValidator()
    const isEmailValid = sut.isValid('some_valid_email@gmail.com')
    expect(isEmailValid).toBe(true)
  })
})
