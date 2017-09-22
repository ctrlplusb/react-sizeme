<p align='center'>
  <img src='https://raw.githubusercontent.com/ctrlplusb/react-sizeme/master/assets/logo.png' width='250'/>
  <p align='center'>Make your React Components aware of their width, height and position!</p>
</p>

[![npm](https://img.shields.io/npm/v/react-sizeme.svg?style=flat-square)](http://npm.im/react-sizeme)
[![MIT License](https://img.shields.io/npm/l/react-sizeme.svg?style=flat-square)](http://opensource.org/licenses/MIT)
[![Travis](https://img.shields.io/travis/ctrlplusb/react-sizeme.svg?style=flat-square)](https://travis-ci.org/ctrlplusb/react-sizeme)
[![Codecov](https://img.shields.io/codecov/c/github/ctrlplusb/react-sizeme.svg?style=flat-square)](https://codecov.io/github/ctrlplusb/react-sizeme)

```javascript
import sizeMe from 'react-sizeme'

function MyComponent({ size }) {
  return (
    <div>My width is {size.width}px</div>
  )
}

export default sizeMe()(MyComponent)
```

* Responsive Components!
* Easy to use.
* Monitor Width OR Height.
* Extensive browser support.
* Supports any Component type, i.e. stateless/class.
* 8.85KB gzipped.

## TOCs

 - [Intro](https://github.com/ctrlplusb/react-sizeme#intro)
 - [Demo](https://github.com/ctrlplusb/react-sizeme#live-demo)
 - [Usage and API Details](https://github.com/ctrlplusb/react-sizeme#usage-and-api-details)
 - [`onSize` callback alternative usage](https://github.com/ctrlplusb/react-sizeme#onsize-callback-alternative-usage)
 - [A highly recommended abstraction: `react-component-queries`](https://github.com/ctrlplusb/react-sizeme#a-highly-recommended-abstraction-react-component-queries)
 - [On the First Render of your Component](https://github.com/ctrlplusb/react-sizeme#on-the-first-render-of-your-component)
 - [Controlling the `size` data refresh rate](https://github.com/ctrlplusb/react-sizeme#controlling-the-size-data-refresh-rate)
 - [Server Side Rendering](https://github.com/ctrlplusb/react-sizeme#server-side-rendering)
 - [Extreme Appreciation](https://github.com/ctrlplusb/react-sizeme#extreme-appreciation)


## Intro

Give your Components the ability to have render logic based on their height/width/position. Responsive design on the Component level.  This allows you to create highly reusable components that don't care about where they will be rendered.

Check out a working demo here: https://react-sizeme.now.sh

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

Here is a full specification of all the properties available to the configuration object, with the default values assigned:

```javascript
const sizeMeConfig = {
  // If true, then any changes to your Components rendered width will cause an
  // recalculation of the "size" prop which will then be be passed into
  // your Component.
  monitorWidth: true,

  // If true, then any changes to your Components rendered height will cause an
  // recalculation of the "size" prop which will then be be passed into
  // your Component.
  monitorHeight: false,

  // NOTE: This currently does not work, apologies. You will get a value if
  // you set this to true, but if only your components position changes and 
  // not its size then you will not get an updated position. I need to 
  // look deeper into this to find a performant solution. 
  // If true, then any changes to your Components position will cause an
  // recalculation of the "size" prop which will then be be passed into
  // your Component.
  monitorPosition: false,

  // The maximum frequency, in milliseconds, at which size changes should be
  // recalculated when changes in your Component's rendered size are being
  // detected. This should not be set to lower than 16.
  refreshRate: 16,

  // The mode in which refreshing should occur.  Valid values are "debounce"
  // and "throttle".  "throttle" will eagerly measure your component and then
  // wait for the refreshRate to pass before doing a new measurement on size
  // changes. "debounce" will wait for a minimum of the refreshRate before
  // it does a measurement check on your component.  "debounce" can be useful
  // in cases where your component is animated into the DOM.
  // NOTE: When using "debounce" mode you may want to consider disabling the
  // placeholder as this adds an extra delay in the rendering time of your
  // component.
  refreshMode: 'throttle',

  // By default we render a "placeholder" component initially so we can try
  // and "prefetch" the expected size for your component.  This is to avoid
  // any unnecessary deep tree renders.  If you feel this is not an issue
  // for your component case and you would like to get an eager render of
  // your component then disable the placeholder using this config option.
  // NOTE: You can set this globally. See the docs on first render.
  noPlaceholder: false
}
```

When you execute the `sizeMe` function it will return a Higher Order Component (HOC).  You can use this Higher Order Component to decorate any of your existing Components with the size awareness ability.  Each of the Components you decorate will then recieve a `size` prop, which is an object of schema `{ width: ?number, height: ?number, position: ?{ left: number, top: number, right: number, bottom: number} }` - the numbers representing pixel values. Note that the values can be null until the first measurement has taken place, or based on your configuration.  Here is a verbose example showing full usage of the API:

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
import React from 'react';
import PropTypes from 'prop-types';
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

> EXTRA POINTS! Combine the above with a code splitting API (e.g. Webpack's System.import) to avoid unnecessary code downloads for your clients. Zing!

__Important things to remember__

*  We don't monitor height or position by default as these are likely to create a high throughput of "size prop updates".  It is up to you to enable and handle these appropriately.
* If you aren't monitoring a specific dimension (width, height, position) you will be provided `null` values for the respective dimension.
* `refreshRate` is set very low.  If you are using this library in a manner where you expect loads of active changes to your components dimensions you may need to tweak this value to avoid browser spamming.
* If you are doing Server Side Rendering please read our recommendations [here](https://github.com/ctrlplusb/react-sizeme#server-side-rendering).

## `onSize` callback alternative usage

`react-sizeme` has now been extended to allow you to use your size aware components in an alternative fashion - having their size data be passed to a given callback function, rather than passed down to your component via a prop.  This can give a nice alternative level of control, allowing the parent component to act as the intelligent container making all the decisions based on the size data.

I would highlight that for now this is an experimental feature, and wouldn't recommend over-use of it unless you are brave or have desperate need of it.  I'd like to gather some nice feedback from the community on how useful this is to them and what other considerations I should make around it's API.

Here is an example of it's usage.

Firstly, create a component you wish to know the size of:

```jsx
import sizeMe from 'react-sizeme'

function Hello({ to }) {
  // ❗️ NOTE: no size prop will be provided if onSize callback was provided.
  return <div>Hello {to}!</div>
}

export default sizeMe()(Hello)
```

Now create a component that will render your component, providing it a `onSize` callback function to get it's size.

```jsx
class MyContainerComponent extends React.Component {
  onSize = (size) => {
    console.log('MyComponent')
  }

  render() {
    return <Hello to="🌎" onSize={this.onSize} />
  }
}
```

Zing. Let me know if you have issues/ideas!

#  A highly recommended abstraction (`react-component-queries`)

This library is great, however, it is quite low-level and has some "side-effects":

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

Should you wish to avoid the render of a placeholder and have an eager render of your component then you can use the `noPlaceholder` configuration option.  Your component will then be rendered directly, however, the `size` prop will not contain any data - so you will have to decide how to best render your component without this information.  After it is rendered `size-me` will do it's thing and pass in the `size` prop.

## Controlling the `size` data refresh rate

The intention of this library to aid in initial render on a target device, i.e. mobile/tablet/desktop.  In this case we just want to know the size as fast as possible.  Therefore the `refreshRate` is configured with a very low value - specifically updates will occur within 16ms time windows.  

If however you wish to use this library to wrap a component that you expect to be resized via user/system actions then I would recommend that you consider setting the `refreshRate` to a higher setting so that you don't spam the browser with updates.  

##  Server Side Rendering

Okay, I am gonna be up front here and tell you that using this library in an SSR context is most likely a bad idea.  If you insist on doing so you then you should take the time to make yourself fully aware of any possible repercussions you application may face.  

A standard `sizeMe` configuration involves the rendering of a placeholder component.  After the placeholder is mounted to the DOM we extract it's dimension information and pass it on to your actual component.  We do this in order to avoid any unnecessary render cycles for possibly deep component trees.  Whilst this is useful for a purely client side set up, this is less than useful for an SSR context as the delivered page will contain empty placeholders.  Ideally you want actual content to be delivered so that users without JS can still have an experience, or SEO bots can scrape your website.

To avoid the rendering of placeholders in this context you can make use of the `noPlaceholders` global configuration value.  Setting this flag will disables any placeholder rendering.  Instead your wrapped component will be rendered directly - however it's initial render will contain no values within the `size` prop (i.e. `width`, `height`, and `position` will be `null`).

```javascript
import sizeMe from 'react-sizeme';

// This is a global variable. i.e. will be the default for all instances.
sizeMe.noPlaceholders = true;
```

> Note: if you only partialy server render your application you may want to use the component level configuration that allows disabling placeholders per component (e.g. `sizeMe({ noPlaceholder: true })`)

It is up to you to decide how you would like to initially render your component then.  When your component is sent to the client and mounted to the DOM `SizeMe` will calculate and send the dimensions to your component as normal.  I suggest you tread very carefully with how you use this updated information and do lots of testing using various screen dimensions.  Try your best to avoid unnecessary re-rendering of your components, for the sake of your users.

If you come up with any clever strategies for this please do come share them with us! :)

## Extreme Appreciation!

We make use of the awesome [element-resize-detector](https://github.com/wnr/element-resize-detector) library.  This library makes use of an scroll/object based event strategy which outperforms window resize event listening dramatically.  The original idea for this approach comes from another library, namely [css-element-queries](https://github.com/marcj/css-element-queries) by Marc J. Schmidt.  I recommend looking into these libraries for history, specifics, and more examples.  I love them for the work they did, whithout which this library would not be possible. :sparkle-heart:
