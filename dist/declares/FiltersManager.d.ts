import {Filter, FilterValue} from '@exp1/common-utils'

type Mode = 'strict' | 'soft'

export class FiltersManager {
  constructor(filters?: Filter[] | null | undefined)
  getFilterIndex(field: string): number
  isFilterPassed(field: string): boolean
  getFilterValue(field: string): FilterValue
  getFilterValues(field: string): FilterValue[]
  getFilterStringValues(field: string): string[]
  replaceByIndex(filter: Filter, index: number): FiltersManager
  removeByIndex(index: number): FiltersManager
  removeByField(field: string): FiltersManager
  prepend(filter: Filter, mode: Mode): FiltersManager
  append(filter: Filter, mode: Mode): FiltersManager
  get filters(): Filter[]
  clone(): FiltersManager
}
