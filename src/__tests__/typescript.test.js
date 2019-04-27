import { checkDirectory } from 'typings-tester'

describe('TypeScript definitions', () => {
  it('should compile against easy-peasy.d.ts', () => {
    checkDirectory(`${__dirname}/typescript`)
  })
})
