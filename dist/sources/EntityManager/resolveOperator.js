const {isArray, isNumber, isBoolean, isString} = require('lodash')

const resolveOperator = (op, value) => {
  if (!op) {
    if (isArray(value)) {
      return 'in'
    }

    if (isNumber(value) || isBoolean(value) || isString(value)) {
      return '=='
    }

    throw new Error(`Unexpected value '${JSON.stringify(value)}', op not passed`)
  }

  if (
    ['==', '!=', '>', '<', '>=', '<=', 'array-contains'].includes(op) &&
    (isNumber(value) || isBoolean(value) || isString(value))
  ) {
    return op
  }

  if (['in', 'not-in', 'array-contains-any'].includes(op) && isArray(value)) {
    return op
  }

  throw new Error(`Unexpected value '${JSON.stringify(value)}', op '${op}'`)
}

module.exports = {
  resolveOperator,
}
