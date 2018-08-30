declare module 'react-sizeme' {

  type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;

  export interface SizeMeProps {
    size: {
      width: number | null;
      height: number | null;
    };
  }

  export interface SizeMeOptions {
    monitorWidth?: boolean;
    monitorHeight?: boolean;
    monitorPosition?: boolean;
    refreshRate?: number;
    refreshMode?: 'throttle' | 'debounce';
    noPlaceholder?: boolean;
  }

  export class SizeMe extends React.Component<SizeMeOptions> {
  }

  export const withSize: (options?: SizeMeOptions) => <P extends SizeMeProps>(component: React.ComponentType<P>) => React.ComponentType<Omit<P, 'size'>>;

}
