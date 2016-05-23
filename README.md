<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-sizeme/master/assets/logo.png' width='250'/>
  <p align='center'>Make your React Components aware of their width and height</p>
</p>

<p align='center'>
[![Travis](https://img.shields.io/travis/ctrlplusb/react-sizeme.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-sizeme)
[![npm](https://img.shields.io/npm/v/react-sizeme.svg?style=flat-square)](http://npm.im/react-sizeme)
[![MIT License](https://img.shields.io/npm/l/react-sizeme.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-sizeme.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-sizeme)
[![Maintenance](https://img.shields.io/maintenance/yes/2016.svg?style=flat-square)]()

* Responsive Components!
* Easy to use.
* Extensive browser support.
* Supports any Component type, i.e. stateless/class.
* Works with React 0.14.x and 15.x.x.
* 7.67KB gzipped standalone, even smaller if bundled with your assets.


## Index

 - [What is this for?](https://github.com/ctrlplusb/react-sizeme#what-is-this-for)
 - [Release Notes](https://github.com/ctrlplusb/react-sizeme#release-notes)
 - [Live Demo](https://github.com/ctrlplusb/react-sizeme#live-demo)
 - [Quick Example](https://github.com/ctrlplusb/react-sizeme#quick-example)
 - [Usage and API Details](https://github.com/ctrlplusb/react-sizeme#usage-and-api-details)
 - [On the First Render of your Component](https://github.com/ctrlplusb/react-sizeme#on-the-first-render-of-your-component)
 - [Things to Consider](https://github.com/ctrlplusb/react-sizeme#things-to-consider)
 - [Server Side Rendering](https://github.com/ctrlplusb/react-sizeme#server-side-rendering)
 - [Extreme Appreciation](https://github.com/ctrlplusb/react-sizeme#extreme-appreciation)


## What is this for?

Give your Components the ability to have render logic based on their height/width. Responsive design on the Component level.  This allows you to create highly reusable components that don't care about where they will be rendered.

## Live Demo

It really does work! Look:

https://react-sizeme-example-anpinwkzyc.now.sh

## Release Notes

See here: https://github.com/ctrlplusb/react-sizeme/releases

## Quick Example

Below is a super simple example highlighting the use of the library. Read the Usage section in its entirety for a full description on configuration and usage.

```javascript
import SizeMe from 'react-sizeme';

class MyComponent extends Component {
  render() {
    // We receive a "size" prop that contains "width" and "height"!
    return (
      <div>My width is {this.props.size.width}px</div>
    );
  }
}

// Wired up here!
export default SizeMe()(MyComponent);
```

## Usage and API Details

First install the library.

```javascript
npm install react-sizeme
```

We provide you with a function called `SizeMe`.  You can import it like so:

```javascript
import SizeMe from 'react-sizeme';
```

When using the `SizeMe` function you first have to pass it a configuration object.  The entire configuration object is optional, as is each of its properties (in which case the defaults would be used).  

Here is a full specification of all the properties available to the configuration object:

```javascript
const sizeMeConfig = {

  // If true, then any changes to your Components rendered width will cause an
  // recalculation of the "size" prop which will then be be passed into
  // your Component.
  // If false, then any changes to your Components rendered width will NOT
  // cause any recalculation of the "size" prop. Additionally any "size" prop
  // that is passed into your Component will always have a `null` value
  // for the "width" property.
  monitorWidth: true,  // Default value
  
  // If true, then any changes to your Components rendered height will cause an
  // recalculation of the "size" prop which will then be be passed into
  // your Component.
  // If false, then any changes to your Components rendered height will NOT
  // cause any recalculation of the "size" prop. Additionally any "size" prop
  // that is passed into your Component will always have a `null` value
  // for the "height" property.
  monitorHeight: false, // Default value
  
  // The maximum frequency, in milliseconds, at which size changes should be
  // recalculated when changes in your Component's rendered size are being
  // detected. This should not be set to lower than 16.
  refreshRate: 16  // Default value
  
};
```

When you execute the `SizeMe` function it will return a Higher Order Component (HOC).  You can use this Higher Order Component to decorate any of your existing Components with the size awareness ability.  Each of the Components you decorate will then recieve a `size` prop, which is an object of schema `{ width: number, height: number }` - the numbers representing pixel values.  Here is a verbose example showing full usage of the API:

```javascript
import SizeMe from 'react-sizeme';

class MyComponent extends Component {
  render() {
    const { width, height } = this.props.size;

    return (
      <div>My size is {width}px x {height}px</div>
    );
  }
}

// Create the config
const config = { monitorHeight: true };

// Call SizeMe with the config to get back the HOC. 
const SizeMeHOC = SizeMe(config);

// Wrap your component with the HOC.
export default SizeMeHOC(MyComponent);
```

You could also express the above much more concisely:

```javascript
import SizeMe from 'react-sizeme';

class MyComponent extends Component {
  render() {
    const { width, height } = this.props.size;

    return (
      <div>My size is {width}px x {height}px</div>
    );
  }
}
 
export default SizeMe({ monitorHeight: true })(MyComponent);
```

That's it.  Its really useful for doing things like optionally loading a child component based on the available space.

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

__IMPORTANT__:

*  We don't monitor height by default, so if you use the default settings and your component only changes in height it won't cause a recalculation of the `size` prop.  I figured that in most cases we care about the width only and it would be annoying if vertical text spanning kept throwing out updates.
* If you aren't monitoring a specific dimension (width or height) you will be provided `null` values for the respective dimension.  This is to avoid any possible misconfigured implementation whoopsies. In the case of Server Side Rendering you would also receive nulls - read more about the SSR case [here](https://github.com/ctrlplusb/react-sizeme#server-side-rendering).
* `refreshRate` is set very low.  If you are using this library in a manner where you expect loads of active changes to your components dimensions you may need to tweak this value to avoid browser spamming.

## On the First Render of your Component

Ok, we have a bit of a chicken/egg scenario.  We can't know the width/height of your Component until it is rendered.  This can lead wasteful rendering cycles should you choose to render your components based on their width/height.  

Therefore for the first render of your component we actually render a lightweight placeholder in place of your component in order to obtain the width/height that will become available to your Component. If your component was being passed a `className` or `style` prop then these will be applied to the placeholder so that it can more closely resemble your Component.

In cases where you have styles/classes contained within your component which directly affect your components proportions, you may want to consider creating an internal wrapped component that you can then pass the className/style into.  For example:

```javascript
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
// will have a handle on the 'className'.
function MyComponentWrapper(props) {
  return (
    <MySizeAwareComponent className={cssStyles.foo} {...props} />
  );
}

export default MyComponentWrapper;
```

## Things to consider

The intention of this library to aid in initial render on a target device, i.e. mobile/tablet/desktop.  In this case we just want to know the size as fast as possible.  Therefore the `refreshRate` is configured with a very low value - specifically updates will occur within 16ms time windows.  

If however you wish to use this library to wrap a component that you expect to be resized via user/system actions then I would recommend that you consider setting the `refreshRate` to a higher setting so that you don't spam the browser with updates.  

##  Server Side Rendering

Okay, I am gonna be up front here and tell you that using this library in an SSR context is most likely a bad idea.  However, if you insist on doing so you then you should take the time to make yourself fully aware of any possible repurcussions you application may face.  

A standard `SizeMe` configuration involves the rendering of a placeholder component.  After the placeholder is mounted to the DOM we extract it's dimension information and pass it on to your actual component.  We do this in order to avoid any unneccesary render cycles for possibly deep component trees.  Whilst this is useful for a purely client side set up, this is less than useful for an SSR context as the delivered page will contain empty placeholders.  Ideally you want actual content to be delivered so that users without JS can still have an experience, or SEO bots can scrape your website.

Therefore we have provided a global configuration flag on `SizeMe`.  Setting this flag will switch the library into an SSR mode, which essentially disables any placeholder rendering.  Instead your wrapped component will be rendered directly.  You should set the flag within the initialisation of your application (for both client/server).

```javascript
import SizeMe from 'react-sizeme';

SizeMe.enableSSRBehaviour = true; // default is false
``` 

In a server context we can't know the width/height of your component so you will simply receive `null` values for both.  It is up to you to decide how you would like to render your component then.  When your component is sent to the client and mounted to the DOM `SizeMe` will calculate and send the dimensions to your component as normal.  I suggest you tread very carefully with how you use this updated information and do lots of testing using various screen dimensions.  Try your best to avoid unnecessary re-rendering of your components, for the sake of your users.

If you come up with any clever strategies for this please do come share them with us! :) 

## Extreme Appreciation!

We make use of the awesome [element-resize-detector](https://github.com/wnr/element-resize-detector) library.  This library makes use of an scroll/object based event strategy which outperforms window resize event listening dramatically.  The original idea for this approach comes from another library, namely [css-element-queries](https://github.com/marcj/css-element-queries) by Marc J. Schmidt.  I recommend looking into these libraries for history, specifics, and more examples.  I love them for the work they did, whithout which this library would not be possible. :sparkle-heart:
