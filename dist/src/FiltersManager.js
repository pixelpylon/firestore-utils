const {cloneDeep, findIndex, isArray} = require('lodash')

class FiltersManager {
  constructor(filters) {
    this._filters = filters ? cloneDeep(filters) : []
  }

  getFilterIndex(field) {
    return findIndex(this._filters, {field})
  }

  isFilterPassed(field) {
    return this.getFilterIndex(field) >= 0
  }

  getFilterValue(field) {
    const index = this.getFilterIndex(field)
    const filter = this._filters[index]

    if (!filter) {
      throw new Error(`Can't find filter by field '${field}'`)
    }

    const value = typeof filter.value === 'object' && 'value' in filter.value ? filter.value.value : filter.value

    if (isArray(value)) {
      throw new Error(`Value '${JSON.stringify(value)}' is not primitive`)
    }

    return value
  }

  getFilterValues(field) {
    const index = this.getFilterIndex(field)
    const filter = this._filters[index]

    if (!filter) {
      throw new Error(`Can't find filter by field '${field}'`)
    }

    const value = typeof filter.value === 'object' && 'value' in filter.value ? filter.value.value : filter.value

    if (!isArray(value)) {
      throw new Error(`Value '${JSON.stringify(value)}' is not array`)
    }

    return value
  }

  getFilterStringValues(field) {
    const values = this.getFilterValues(field)

    return values.map((value) => {
      if (typeof value === 'string') {
        return value
      }

      throw new Error(`Filter value '${value}' is not string`)
    })
  }

  replaceByIndex(filter, index) {
    if (index < 0 || index >= this._filters.length) {
      throw new Error(`Can't find filter by index ${index}`)
    }

    this._filters = cloneDeep(this.filters)
    this._filters[index] = filter

    return this
  }

  removeByIndex(index) {
    if (index < 0 || index >= this._filters.length) {
      throw new Error(`Can't find filter by index ${index}`)
    }

    this._filters = cloneDeep(this.filters)
    delete this._filters[index]
    return this
  }

  removeByField(field) {
    const index = this.getFilterIndex(field)

    if (index < 0) {
      return this
    }

    this._filters = cloneDeep(this.filters)
    delete this._filters[index]
    return this
  }

  prepend(filter, mode = 'soft') {
    if (!filter) {
      return this
    }

    const filterIndex = findIndex(this._filters, {field: filter.field})

    if (filterIndex < 0) {
      this._filters = [filter, ...this._filters]
      return this
    }

    if (mode === 'soft') {
      this.replaceByIndex(filter, filterIndex)
      return this
    }

    this.removeByIndex(filterIndex)
    this._filters = [filter, ...this._filters]
    return this
  }

  append(filter, mode = 'soft') {
    if (!filter) {
      return this
    }

    const filterIndex = findIndex(this._filters, {field: filter.field})

    if (filterIndex < 0) {
      this._filters = [...this._filters, filter]
      return this
    }

    if (mode === 'soft') {
      this.replaceByIndex(filter, filterIndex)
      return this
    }

    this.removeByIndex(filterIndex)
    this._filters = [...this._filters, filter]
    return this
  }

  get filters() {
    return this._filters
  }

  clone() {
    return new FiltersManager(cloneDeep(this._filters))
  }
}

module.exports = {
  FiltersManager,
}
