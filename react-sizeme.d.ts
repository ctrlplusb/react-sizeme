import { Component, ComponentType, ReactNode, ReactElement } from 'react'

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export interface SizeMeProps {
  readonly size: {
    readonly width: number | null
    readonly height: number | null
  }
}

export interface SizeMeOptions {
  monitorHeight?: boolean
  monitorPosition?: boolean
  monitorWidth?: boolean
  noPlaceholder?: boolean
  refreshMode?: 'throttle' | 'debounce'
  refreshRate?: number
}

export interface SizeMeRenderProps extends SizeMeOptions {
  children: (props: SizeMeProps) => ReactElement
}

export class SizeMe extends Component<SizeMeRenderProps> {}

export type WithSizeOnSizeCallback = (size: SizeMeProps['size']) => void 

export interface WithSizeProps { 
  onSize?: WithSizeOnSizeCallback
}

export const withSize: (
  options?: SizeMeOptions,
) => <P extends object = {}>(
  component: ComponentType<P>,
) => ComponentType<Omit<P, 'size'> & WithSizeProps>
