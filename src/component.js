import React, { Component } from 'react'
import isShallowEqual from 'shallowequal'
import PropTypes from 'prop-types'
import withSize from './with-size'

export default class SizeMe extends Component {
  static propTypes = {
    children: PropTypes.func,
    render: PropTypes.func,
  }

  static defaultProps = {
    children: undefined,
    render: undefined,
  }

  constructor(props) {
    super(props)
    const { children, render, ...sizeMeConfig } = props
    this.createComponent(sizeMeConfig)
    this.state = {
      size: {
        width: undefined,
        height: undefined,
      },
    }
  }

  componentDidUpdate(prevProps) {
    const {
      children: prevChildren,
      render: prevRender,
      ...currentSizeMeConfig
    } = this.props
    const {
      children: nextChildren,
      render: nextRender,
      ...prevSizeMeConfig
    } = prevProps
    if (!isShallowEqual(currentSizeMeConfig, prevSizeMeConfig)) {
      this.createComponent(currentSizeMeConfig)
    }
  }

  createComponent = config => {
    this.SizeAware = withSize(config)(({ children }) => children)
  }

  onSize = size => this.setState({ size })

  render() {
    const { SizeAware } = this
    const render = this.props.children || this.props.render
    return (
      <SizeAware onSize={this.onSize}>
        {render({ size: this.state.size })}
      </SizeAware>
    )
  }
}
