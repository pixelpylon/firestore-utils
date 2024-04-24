const {v4: uuid} = require('uuid')
const {Transaction} = require('../Transaction')
const {queryPaginatedList} = require('./queryPaginatedList')
const {applyViews} = require('./applyViews')
const {first} = require('../utils/first')
const {parallellizedQueryList} = require('./parallellizedQueryList')

class EntityTransactionManager {
  constructor(tx, db, collectionName) {
    this.tx = tx
    this.db = db
    this.transaction = new Transaction(tx, db, collectionName)
    this.collectionName = collectionName
  }

  ref(id) {
    return this.transaction.ref(id)
  }

  async create(entity, id) {
    const resultId = id || uuid()

    const data = {
      ...entity,
      id: resultId,
      createdAt: new Date().toISOString(),
    }

    return this.transaction.create(resultId, data)
  }

  async update(id, entity) {
    const data = {
      ...entity,
      modifiedAt: new Date().toISOString(),
    }

    return this.transaction.update(id, data)
  }

  async one(id) {
    return this.transaction.one(id)
  }

  async item(id) {
    const item = await this.transaction.one(id)

    if (!item) {
      throw new Error(`Can't find item of ${this.collectionName} by id '${id}'`)
    }

    return item
  }

  async first({parallel, filters, ordering, views}) {
    if (views) {
      const list = await parallellizedQueryList(this.transaction, parallel, filters, ordering)
      return first(applyViews(list, views))
    }

    const list = await parallellizedQueryList(this.transaction, parallel, filters, ordering, 1)
    return first(list)
  }

  async list({parallel, filters, ordering, limit, views}) {
    const list = await parallellizedQueryList(this.transaction, parallel, filters, ordering, limit)
    return applyViews(list, views)
  }

  async paginatedList({filters, ordering, cursor, limit}) {
    return queryPaginatedList(this.transaction, {filters, ordering, cursor, limit})
  }

  remove(id) {
    return this.transaction.delete(id)
  }
}

module.exports = {
  EntityTransactionManager,
}
