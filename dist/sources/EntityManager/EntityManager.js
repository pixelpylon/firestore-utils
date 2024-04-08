const {v4: uuid} = require('uuid')
const {Repository} = require('../Repository')
const {first} = require('../utils/first')
const {EntityTransactionManager} = require('./EntityTransactionManager')
const {applyViews} = require('./applyViews')
const {queryPaginatedList} = require('./queryPaginatedList')
const {parallellizedQueryList} = require('./parallellizedQueryList')

class EntityManager {
  constructor(db, collectionName) {
    this.collectionName = collectionName
    this.db = db
    this.repository = new Repository(db, collectionName)
  }

  async create(entity, id) {
    const resultId = id || uuid()

    const data = {
      ...entity,
      id: resultId,
      createdAt: new Date().toISOString(),
    }

    const ref = await this.repository.create(resultId, data)
    return this.item(ref.id)
  }

  async update(id, entity) {
    const data = {
      ...entity,
      modifiedAt: new Date().toISOString(),
    }

    const ref = await this.repository.update(id, data)
    return this.item(ref.id)
  }

  remove(id) {
    return this.repository.delete(id)
  }

  async item(id) {
    const item = await this.repository.one(id)

    if (!item) {
      throw new Error(`Can't find item of ${this.collectionName} by id '${id}'`)
    }

    return item
  }

  async one(id) {
    return this.repository.one(id)
  }

  async first({parallel, filters, ordering, views}) {
    if (views) {
      const list = await parallellizedQueryList(this.repository, parallel, filters, ordering)
      return first(applyViews(list, views))
    }

    const list = await parallellizedQueryList(this.repository, parallel, filters, ordering, 1)
    return first(list)
  }

  async list({parallel, filters, ordering, limit, views}) {
    const list = await parallellizedQueryList(this.repository, parallel, filters, ordering, limit)
    return applyViews(list, views)
  }

  async paginatedList({filters, ordering, cursor, limit}) {
    return queryPaginatedList(this.repository, {filters, ordering, cursor, limit})
  }

  tx(tx) {
    return new EntityTransactionManager(tx, this.db, this.collectionName)
  }
}

module.exports = {
  EntityManager,
}
