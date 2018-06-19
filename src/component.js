import React, { Component } from 'react'
import isShallowEqual from 'shallowequal'
import PropTypes from 'prop-types'
import withSize from './with-size'

export default class SizeMe extends Component {
  static propTypes = {
    render: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    const { render, ...sizeMeConfig } = props
    this.createComponent(sizeMeConfig)
    this.state = {
      size: {
        width: undefined,
        height: undefined,
      },
    }
  }

  componentWillReceiveProps(nextProps) {
    const { render: prevRender, ...prevSizeMeConfig } = this.props
    const { render: nextRender, ...nextSizeMeConfig } = nextProps
    if (!isShallowEqual(prevSizeMeConfig, nextSizeMeConfig)) {
      this.createComponent(nextSizeMeConfig)
    }
  }

  createComponent = config => {
    this.SizeAware = withSize(config)(({ children }) => children)
  }

  render() {
    const { SizeAware } = this
    return (
      <SizeAware onSize={size => this.setState({ size })}>
        {this.props.render({ size: this.state.size })}
      </SizeAware>
    )
  }
}
