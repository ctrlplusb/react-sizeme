import * as React from 'react'
import { withSize, SizeMeProps, WithSizeOnSizeCallback } from 'react-sizeme'

interface MyComponentProps extends SizeMeProps {
  id: number
}

function MyComponent({ id, size }: MyComponentProps) {
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
  return <div>My width is {size.width}px</div>
}

const SizedMyComponent = withSize()(MyComponent)

const onSize: WithSizeOnSizeCallback = ({ height, width }) => {
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
}

const foo = <SizedMyComponent id={1} onSize={onSize} />
