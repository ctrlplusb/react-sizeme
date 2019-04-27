import * as React from 'react'
import { SizeMe } from 'react-sizeme'

function MyApp() {
  return (
    <SizeMe>
      {({ size }) => {
        const { width, height } = size
        if (width) {
          const foo = width + 1
        }
        if (height) {
          const foo = height + 1
        }
        // typings:expect-error
        const h1 = height + 1
        // typings:expect-error
        const w1 = width + 1
        return <div />
      }}
    </SizeMe>
  )
}
