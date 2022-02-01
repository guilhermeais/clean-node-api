module.exports = class InvalidParamError extends Error {
  constructor (paramName) {
    super(`invalid param: ${paramName}`)
    this.name = 'InvalidParamError'
  }
}
