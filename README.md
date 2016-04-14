<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-sizeme/master/assets/logo.png' width='350'/>
  <p align='center'>Make your React Components aware of their width and height</p>
</p>

[![Travis](https://img.shields.io/travis/ctrlplusb/react-sizeme.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-sizeme)
[![npm](https://img.shields.io/npm/v/react-sizeme.svg?style=flat-square)](http://npm.im/react-sizeme)
[![MIT License](https://img.shields.io/npm/l/react-sizeme.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-sizeme.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-sizeme)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?style=flat-square)]()

* Easy to use.
* Extensive browser support.
* Supports any Component type, i.e. stateless/class.
* Works with React 0.14.x and 15.x.x.
* Responsive Components!

## What is this for?

Give your Components the ability to have render logic based on their height/width.

## Live Demo

Perhaps it's easiest just to show a live example:

https://react-sizeme-example-xcnwvtdzmb.now.sh

## Simple Example 

Below is a partial example highlighting the use of the library. Read the Usage section in it's entirety for a full description on configuration and usage.

```
class MyComponent extends Component {
  render() {
    const { width, height } = this.props.size;
  
    return (
      <div>My size is {width}px x {height}px</div>
    );
  }
}

export default SizeMeHOC(MyComponent);  // Wired up here!
```

## Usage

First install the library.

```
npm install react-sizeme
```

Then identify a Component you would like to make aware of it's size. We provide you with a helper function called `SizeMe`.  You can import it like so:

```
import SizeMe from 'react-sizeme';
```

You first have to pass the `SizeMe` function a configuration object.  The entire configuration object is optional, as is each of it's properties, in which case the defaults would be used.  Here is a full configuration example with the default values for each of the properties:

```
const SizeMeHOC = SizeMe({
  // If true any changes to `width` will result in a new `size` prop being
  // passed to your Component.
  monitorWidth: true, 
  // If true any changes to `height` will result in a new `size` prop being
  // passed to your Component. 
  monitorHeight: false,
  // The maximum speed, in milliseconds, at which size changes should be 
  // propogated to your Components. This should not be set to lower than 16.
  refreshRate: 16
});
```

When you execute the `SizeMe` function it will return a Higher Order Component.  You can use this Higher Order Component to decorate any of your existing Components with the size awareness ability.  Each of the Components you decorate will then recieve a `size` prop, which is an object of schema `{ width: number, height: number }` - the numbers representing pixel values.  Below is an example:

```
class MyComponent extends Component {
  render() {
    const { width, height } = this.props.size;
  
    return (
      <div>My size is {width}px x {height}px</div>
    );
  }
}

export default SizeMeHOC(MyComponent);  // Wired up here!
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

export default SizeMe({ monitorHeight: true })(MyComponent);
```

## On the First Render of your Component

Ok, we have a bit of a chicken/egg scenario.  We can't know the width/height of your Component until it is rendered.  This can lead to less than ideal cases, for example based on the rendered size of your component you may have logic that renders the internals of your component entirely.  This can lead to some wasteful rendering.  

Therefore for the first render of your component we actually render a lightweight placeholder in order to obtain the width/height for your Component render. In addition to this, if you were passing any `className` or `style` props into your object these will be used for the render of the placeholder, which can be useful in cases where you are pre-rendering it with specific dimensions based on the CSS.

An example of this:

```
import cssStyles from './styles.css';
import MySizeAwareComponent from './MySizeAwareComponent';

const inlineStyle = {
  backgroundColor: 'pink'
};

function App() {
    return (
      <MySizeAwareComponent 
        className={cssStyles.foo} 
        style={inlineStyle} />
    );
}
```

In cases where the styles/classes are contained within your component and you want more accurate first-render `size` resolving we recommend that you create a wrapper component that passes the className/style into your component.  For example we could refactor our `MySizeAwareComponent` like so:

```
import React from 'react';
import cssStyles from './styles.css';
import SizeMe from 'react-sizeme';

class MyComponent extends Component {
  render() {
    const className = this.props.className;
    const { width, height } = this.props.size;
  
    return (
      <div className={className}>
        My size is {width}px x {height}px
      </div>
    );
  }
}

const MySizeAwareComponent = SizeMeHOC(MyComponent);

// We create this wrapper component so that our size aware rendering
// will have a handle on the rendered components css classname.
function MyComponentWrapper(props) {
  return (
    <MySizeAwareComponent className={cssStyles.foo} {...props} />
  );
}

export default MyComponentWrapper;
```

## Under the Hood

We make use of the awesome [element-resize-detector](https://github.com/wnr/element-resize-detector) library.  This library makes use of an scroll/object based event strategy which outperforms window resize event listening dramatically.  The original idea from this approach comes from another library, namely [css-element-queries](https://github.com/marcj/css-element-queries) by Marc J. Schmidt.  I recommend looking into these libraries for history, specifics, and more examples.

##  Caveats.

* Server Side Rendering is not supported.  I am still thinking of the best approach on what to do in the case of a SSR request.  Perhaps I will just return null values for width/height.  Undecided.  Any recommendations are welcome.
* Whilst execution is performant and we try and do smart rendering mechanisms we don't recommend that you place a crazy amount of size aware components into your render tree.  If you do require this I highly recommend you do some decent browser testing for impact. 