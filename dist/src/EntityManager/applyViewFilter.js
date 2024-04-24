const {difference, get} = require('lodash')
const {resolveOperator} = require('./resolveOperator')

const applyViewFilter = (list, filter) => {
  const {field, value} = filter
  const op = resolveOperator(filter.op, value)

  switch (op) {
    case '==':
      return list.filter((item) => get(item, field) === value)
    case '!=':
      return list.filter((item) => get(item, field) !== value)
    case '>':
      return list.filter((item) => get(item, field) > value)
    case '>=':
      return list.filter((item) => get(item, field) >= value)
    case '<':
      return list.filter((item) => get(item, field) < value)
    case '<=':
      return list.filter((item) => get(item, field) <= value)
    case 'in':
      return list.filter((item) => value.includes(get(item, field)))
    case 'not-in':
      return list.filter((item) => !value.includes(get(item, field)))
    case 'array-contains':
      return list.filter((item) => get(item, field).includes(value))
    case 'array-contains-any':
      return list.filter((item) => difference(get(item, field), value) > 0)
  }

  throw new Error(`Can't apply view filter '${JSON.stringify(filter)}'`)
}

module.exports = {
  applyViewFilter,
}
