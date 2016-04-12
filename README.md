<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-sizeme/master/assets/logo.png' width='350'/>
  <p align='center'>Make your React Components aware of their width and height</p>
</p>

[![Travis](https://img.shields.io/travis/ctrlplusb/react-sizeme.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-sizeme)
[![npm](https://img.shields.io/npm/v/react-sizeme.svg?style=flat-square)](http://npm.im/react-sizeme)
[![MIT License](https://img.shields.io/npm/l/react-sizeme.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-sizeme.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-sizeme)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?style=flat-square)]()

## What is this for?

Find out the dimensions (width/height) available to your rendered React Components.

## Live Demo

https://react-sizeme-example-armpgxfodd.now.sh

## Usage

First install.

```
npm install react-sizeme
```

Then identify a Component you would like to make aware of it's size. We provide you with a helper function called `SizeMe`.  You can import it like so:

```
import SizeMe from 'react-sizeme';
```

You first have to pass the `SizeMe` function an configuration.  The configuration is optional, in which case the defaults would be used.  Here is a full configuration example with the default values:

```
const SizeMeHOC = SizeMe({
  // If true any changes to `width` will result in a new `size` prop being
  // passed to your Component.
  monitorWidth: true, 
  // If true any changes to `height` will result in a new `size` prop being
  // passed to your Component. 
  monitorHeight: false,
  // The speed, in milliseconds, at which size changes should be handled.
  // This should not be set lower than 16.  You can change it to a higher
  // value if you wish to reduce flickers on components that get resized
  // often.
  refreshRate: 16
});
```

The result of the execution of the `SizeMe` function is a Higher Order Component.  You can use this Higher Order Component to decorate any of your existing Components with size awareness.  Each of the Components you decorate will then recieve a `size` prop, which is an object of schema `{ width: number, height: number }`.  Below is an example:

```
class MyComponent extends Component {
  render() {
    const { width, height } = this.props.size;
  
    return (
      <div>My size is {width}px x {height}px</div>
    );
  }
}

export default SizeMeHOC(MyComponent);
```

That's it.  It's really useful for doing things like optionally loading a child component based on the available space.

Here is an full example of that in action:

```javascript
import React, { PropTypes } from 'react';
import LargeChildComponent from './LargeChildComponent';
import SmallChildComponent from './SmallChildComponent';
import SizeMe from 'react-sizeme';

function MyComponent(props) {
  const { width, height } = props.size; 

  const ToRenderChild = height > 600 
    ? LargeChildComponent
    : SmallChildComponent;

  return (
    <div>
      <h1>My size is {width}x{height}</div>
      <ToRenderChild />
    </div>
  );
}
MyComponent.propTypes = {
  size: PropTypes.shape({
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  })
}

export default SizeMe(/* default config*/)(MyComponent);
```

##  Caveats.

* We use a double render mechanism using a placeholder div for the initial render.  Therefore we don't recommend that you make every container on your page 