import { Component, ComponentType, ReactNode, ReactElement } from 'react'

type Omit<T, K> = Pick<T, Exclude<keyof T, K>>

export interface SizeMeProps {
  size: {
    width: number | null
    height: number | null
  }
}

export interface SizeMeOptions {
  monitorWidth?: boolean
  monitorHeight?: boolean
  monitorPosition?: boolean
  refreshRate?: number
  refreshMode?: 'throttle' | 'debounce'
  noPlaceholder?: boolean
}

export interface SizeMeRenderProps extends SizeMeOptions {
  children: (props: SizeMeProps) => ReactElement
}

export class SizeMe extends Component<SizeMeRenderProps> {}

export const withSize: (
  options?: SizeMeOptions,
) => <P extends object = {}>(
  component: ComponentType<P>,
) => ComponentType<Omit<P, 'size'>>
