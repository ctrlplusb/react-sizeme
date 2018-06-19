import React from 'react'
import enzyme, { shallow } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import withSizeMock from '../sizeMe'
import SizeMe from '../component'

enzyme.configure({ adapter: new Adapter() })

jest.mock('../sizeMe.js')

const noop = () => undefined

const sizeMeConfig = {
  monitorHeight: true,
  monitorWidth: true,
  refreshRate: 80,
  refreshMode: 'debounce',
  noPlaceholder: true,
  resizeDetectorStrategy: 'foo',
}

describe('<SizeMe />', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    withSizeMock.mockImplementation(() => Component => Component)
  })

  it('should pass down props as configuration to withSize', () => {
    shallow(<SizeMe render={noop} {...sizeMeConfig} />)
    expect(withSizeMock).lastCalledWith(sizeMeConfig)
  })

  it('should monitor and provide the size to the render func', () => {
    let actualSize
    const wrapper = shallow(
      <SizeMe
        render={({ size }) => {
          actualSize = size
        }}
        {...sizeMeConfig}
      />,
    )
    wrapper.prop('onSize')({ width: 100, height: 50 })
    expect(actualSize).toEqual({ width: 100, height: 50 })
  })

  it('should update the sizeme component when a new configuration is provided', () => {
    const wrapper = shallow(<SizeMe render={noop} {...sizeMeConfig} />)
    const newSizeMeConfig = Object.assign({}, sizeMeConfig, {
      monitorHeight: false,
    })
    wrapper.setProps(
      Object.assign({ render: noop }, sizeMeConfig, newSizeMeConfig),
    )
    expect(withSizeMock).toHaveBeenCalledTimes(2)
    expect(withSizeMock).lastCalledWith(newSizeMeConfig)
  })

  it('should not update the sizeme component when a new configuration is provided', () => {
    const wrapper = shallow(<SizeMe render={noop} {...sizeMeConfig} />)
    wrapper.setProps(Object.assign({ render: () => 'NEW!' }, sizeMeConfig))
    expect(withSizeMock).toHaveBeenCalledTimes(1)
  })
})
