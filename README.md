<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-sizeme/master/assets/logo.png' width='250'/>
  <p align='center'>Make your React Components aware of their width and height</p>
</p>

<p align='center'>
[![npm](https://img.shields.io/npm/v/react-sizeme.svg?style=flat-square)](http://npm.im/react-sizeme)
[![MIT License](https://img.shields.io/npm/l/react-sizeme.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/react-sizeme.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-sizeme)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-sizeme.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-sizeme)

* Responsive Components!
* Easy to use.
* Extensive browser support.
* Supports any Component type, i.e. stateless/class.
* Works with React 0.14.x and 15.x.x.
* 7.67KB gzipped standalone, even smaller if bundled with your assets.

## TOCs

 - [What is this for?](https://github.com/ctrlplusb/react-sizeme#what-is-this-for)
 - [Release Notes](https://github.com/ctrlplusb/react-sizeme#release-notes)
 - [Live Demo](https://github.com/ctrlplusb/react-sizeme#live-demo)
 - [Quick Example](https://github.com/ctrlplusb/react-sizeme#quick-example)
 - [Usage and API Details](https://github.com/ctrlplusb/react-sizeme#usage-and-api-details)
 - [`react-component-queries`: a highly recommended abstraction](https://github.com/ctrlplusb/react-sizeme#react-component-queries-a-highly-recommended-abstraction)
 - [On the First Render of your Component](https://github.com/ctrlplusb/react-sizeme#on-the-first-render-of-your-component)
 - [Controlling the `size` data refresh rate](https://github.com/ctrlplusb/react-sizeme#controlling-the-size-data-refresh-rate)
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
import sizeMe from 'react-sizeme';

class MyComponent extends Component {
  render() {
    // We receive a "size" prop that contains "width" and "height"!
    // Note: they may be null until the first measure has taken place.
    return (
      <div>My width is {this.props.size.width}px</div>
    );
  }
}

// Wired up here!
export default sizeMe()(MyComponent);
```

## Usage and API Details

First install the library.

```javascript
npm install react-sizeme
```

We provide you with a function called `sizeMe`.  You can import it like so:

```javascript
import sizeMe from 'react-sizeme';
```

When using the `sizeMe` function you first have to pass it a configuration object.  The entire configuration object is optional, as is each of its properties (in which case the defaults would be used).  

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
  refreshRate: 16,  // Default value

  // The mode in which refreshing should occur.  Valid values are "debounce"
  // and "throttle".  "throttle" will eagerly measure your component and then
  // wait for the refreshRate to pass before doing a new measurement on size
  // changes. "debounce" will wait for a minimum of the refreshRate before
  // it does a measurement check on your component.  "debounce" can be useful
  // in cases where your component is animated into the DOM.
  refreshMode: 'throttle' // Default value
};
```

When you execute the `SizeMe` function it will return a Higher Order Component (HOC).  You can use this Higher Order Component to decorate any of your existing Components with the size awareness ability.  Each of the Components you decorate will then recieve a `size` prop, which is an object of schema `{ width: ?number, height: ?number }` - the numbers representing pixel values. Note that the values can be null until the first measurement has taken place, or based on your configuration.  Here is a verbose example showing full usage of the API:

```javascript
import sizeMe from 'react-sizeme';

class MyComponent extends Component {
  render() {
    const { width, height } = this.props.size;

    return (
      <div>My size is {width || -1}px x {height || -1}px</div>
    );
  }
}

// Create the config
const config = { monitorHeight: true };

// Call SizeMe with the config to get back the HOC.
const sizeMeHOC = sizeMe(config);

// Wrap your component with the HOC.
export default sizeMeHOC(MyComponent);
```

You could also express the above much more concisely:

```javascript
import sizeMe from 'react-sizeme';

class MyComponent extends Component {
  render() {
    const { width, height } = this.props.size;

    return (
      <div>My size is {width}px x {height}px</div>
    );
  }
}

export default sizeMe({ monitorHeight: true })(MyComponent);
```

That's it.  Its really useful for doing things like optionally loading a child component based on the available space.

Here is an full example of that in action:

```javascript
import React, { PropTypes } from 'react';
import LargeChildComponent from './LargeChildComponent';
import SmallChildComponent from './SmallChildComponent';
import sizeMe from 'react-sizeme';

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

export default sizeMe({ monitorHeight: true })(MyComponent);
```

__IMPORTANT__:

*  We don't monitor height by default, so if you use the default settings and your component only changes in height it won't cause a recalculation of the `size` prop.  I figured that in most cases we care about the width only and it would be annoying if vertical text spanning kept throwing out updates.
* If you aren't monitoring a specific dimension (width or height) you will be provided `null` values for the respective dimension.  This is to avoid any possible misconfigured implementation whoopsies. In the case of Server Side Rendering you would also receive nulls - read more about the SSR case [here](https://github.com/ctrlplusb/react-sizeme#server-side-rendering).
* `refreshRate` is set very low.  If you are using this library in a manner where you expect loads of active changes to your components dimensions you may need to tweak this value to avoid browser spamming.

## `react-component-queries`: a highly recommended abstraction

`react-sizeme` is great, however, it suffers with a couple of problems in my opinion:

  1. It is raw in that it provides you with the actual dimensions of your component and then requires to execute logic within your component to establish the desired behaviour of your component.  This can be a bit tedious and polute your component with a lot of if-else statements.  
  2. It is possible that your component may gets spammed with updated `size` props. This is because _any_ time your component changes in size `react-sizeme` will kick in.

With these problems in mind I came up with an abstraction in the form of [`react-component-queries`](https://github.com/ctrlplusb/react-component-queries).  This library allows you to define _query functions_ that will operate on the dimensions provided by `react-sizeme` and when their criteria are met they will pass a custom set of prop(s) to your components. This solves problem 1 by moving the dimension based logic out of your component.  It then solves problem 2 by ensuring that your component will only be called for re-render if any of the prop values change.  That saves you some error prone boilerplate.

This allows you to deal with "simpler" props, for example; a boolean flag indicating if the component is square, an enum representing it's size ('small'|'medium'|'large'), a className, or a style object.  Whatever you feel is most appropriate for your use case.

So, to recap, some of the benefits of using this abstraction are:

  - Simplify your components by moving the dimension logic away from them, which in turn is easier to test in isolation.
  - `shouldComponentUpdate` is implemented on your behalf.
  - The _query functions_ themselves can be formed into a reusable library of queries for all your components.

I am not trying to take away from `react-sizeme`, but I want to highlight that it's a bit more of a low level HOC, and if you want to use it you should be aware of the problems above and consider using your own abstraction or this one.

## On the First Render of your Component

Ok, we have a bit of a chicken/egg scenario.  We can't know the width/height of your Component until it is rendered.  This can lead wasteful rendering cycles should you choose to render your components based on their width/height.  

Therefore for the first render of your component we actually render a lightweight placeholder in place of your component in order to obtain the width/height that will become available to your Component. If your component was being passed a `className` or `style` prop then these will be applied to the placeholder so that it can more closely resemble your Component.

In cases where you have styles/classes contained within your component which directly affect your components proportions, you may want to consider creating an internal wrapped component that you can then pass the className/style into.  For example:

```javascript
import React from 'react';
import cssStyles from './styles.css';
import sizeMe from 'react-sizeme';

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

const MySizeAwareComponent = sizeMe()(MyComponent);

// We create this wrapper component so that our size aware rendering
// will have a handle on the 'className'.
function MyComponentWrapper(props) {
  return (
    <MySizeAwareComponent className={cssStyles.foo} {...props} />
  );
}

export default MyComponentWrapper;
```

## Controlling the `size` data refresh rate

The intention of this library to aid in initial render on a target device, i.e. mobile/tablet/desktop.  In this case we just want to know the size as fast as possible.  Therefore the `refreshRate` is configured with a very low value - specifically updates will occur within 16ms time windows.  

If however you wish to use this library to wrap a component that you expect to be resized via user/system actions then I would recommend that you consider setting the `refreshRate` to a higher setting so that you don't spam the browser with updates.  

##  Server Side Rendering

Okay, I am gonna be up front here and tell you that using this library in an SSR context is most likely a bad idea.  However, if you insist on doing so you then you should take the time to make yourself fully aware of any possible repurcussions you application may face.  

A standard `sizeMe` configuration involves the rendering of a placeholder component.  After the placeholder is mounted to the DOM we extract it's dimension information and pass it on to your actual component.  We do this in order to avoid any unneccesary render cycles for possibly deep component trees.  Whilst this is useful for a purely client side set up, this is less than useful for an SSR context as the delivered page will contain empty placeholders.  Ideally you want actual content to be delivered so that users without JS can still have an experience, or SEO bots can scrape your website.

Therefore we have provided a global configuration flag on `SizeMe`.  Setting this flag will switch the library into an SSR mode, which essentially disables any placeholder rendering.  Instead your wrapped component will be rendered directly.  You should set the flag within the initialisation of your application (for both client/server).

```javascript
import sizeMe from 'react-sizeme';

// This is a global variable. i.e. will be the default for all instances.
sizeMe.enableSSRBehaviour = true; // default is false
```

In a server context we can't know the width/height of your component so you will simply receive `null` values for both.  It is up to you to decide how you would like to render your component then.  When your component is sent to the client and mounted to the DOM `SizeMe` will calculate and send the dimensions to your component as normal.  I suggest you tread very carefully with how you use this updated information and do lots of testing using various screen dimensions.  Try your best to avoid unnecessary re-rendering of your components, for the sake of your users.

If you come up with any clever strategies for this please do come share them with us! :)

## Extreme Appreciation!

We make use of the awesome [element-resize-detector](https://github.com/wnr/element-resize-detector) library.  This library makes use of an scroll/object based event strategy which outperforms window resize event listening dramatically.  The original idea for this approach comes from another library, namely [css-element-queries](https://github.com/marcj/css-element-queries) by Marc J. Schmidt.  I recommend looking into these libraries for history, specifics, and more examples.  I love them for the work they did, whithout which this library would not be possible. :sparkle-heart:
