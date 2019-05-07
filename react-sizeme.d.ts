import { Component, ComponentType, ReactNode, ReactElement } from 'react'

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export interface SizeMeProps {
  readonly size: {
    width: number | null
    height: number | null
  }
}

export interface SizeMeOptions {
  readonly monitorWidth?: boolean
  readonly monitorHeight?: boolean
  readonly monitorPosition?: boolean
  readonly refreshRate?: number
  readonly refreshMode?: 'throttle' | 'debounce'
  readonly noPlaceholder?: boolean
}

export interface SizeMeRenderProps extends SizeMeOptions {
  readonly children: (props: SizeMeProps) => ReactElement
}

export class SizeMe extends Component<SizeMeRenderProps> {}

export type WithSizeOnSizeArgs = [
  {
    readonly height: number | null
    readonly width: number | null
  }
]

export type WithSizeOnSizeCallback = (...x: WithSizeOnSizeArgs) => void 

export interface WithSizeProps { 
  readonly onSize?: WithSizeOnSizeCallback
}

export const withSize: (
  options?: SizeMeOptions,
) => <P extends object = {}>(
  component: ComponentType<P>,
) => ComponentType<Omit<P, 'size'> & WithSizeProps>
