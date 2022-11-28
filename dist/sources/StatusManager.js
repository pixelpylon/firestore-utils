const {getStatusObject} = require('back-utils')
const DocumentAccessor = require('./DocumentAccessor')

const PROCESSING_STATUSES = {
  PENDING: 'pending',
  DONE: 'done',
  ERROR: 'error',
}

class StatusManager {
  constructor (field) {
    this.field = field
  }

  markAsDone (documentRef, additionalData = {}) {
    const updateData = {
      [this.field]: getStatusObject(PROCESSING_STATUSES.DONE),
      ...additionalData,
    }

    return documentRef
      .set(updateData, { merge: true })
  }

  markAsFailed (documentRef, error, additionalData = {}) {
    const updateData = {
      [this.field]: getStatusObject(PROCESSING_STATUSES.ERROR, error),
      ...additionalData,
    }

    return documentRef
      .set(updateData, { merge: true })
  }

  async findUnprocessed (collectionRef) {
    const result = await collectionRef
      .where(`${this.field}.status`, '==', PROCESSING_STATUSES.PENDING)
      .orderBy(`${this.field}.timestamp`, 'asc')
      .get()
    return DocumentAccessor.list(result)
  };
}

StatusManager.PROCESSING_STATUSES = PROCESSING_STATUSES

module.exports = StatusManager
