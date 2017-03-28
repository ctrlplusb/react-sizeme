import { execSync } from 'child_process'
import appRootDir from 'app-root-dir'
import { resolve as resolvePath } from 'path'
import { readFileSync } from 'fs'

export function removeEmpty(x) {
  return x.filter(y => y != null)
}

// This is a higher order function that accepts a boolean condition and will
// return a function allowing you to provide if/else values that should be
// resolved based on the boolean condition.
//
// That sounds complicated, but it isn't really.  See the examples below. :)
//
// For example, say that we have a "isDev" boolean flag had a value of `true`,
// and we would like to create a webpack loader based on this value being true.
// Then when we used this function like so:
//   const ifDev = ifElse(isDev);
//   ifDev('foo');  // => 'foo'
//
// You can also set an "else" value. In the below case the "isDev" flag is false.
//   const ifDev = ifElse(isDev);
//   ifDev('foo', 'bar');  // => 'bar'
//
// The "else" value is optional, in which case a null value would be returned.
//
// This is really handy for doing inline value resolution within or webpack
// configuration.  Then we simply use one of our other utility functions (e.g.
// removeEmpty) to remove all the nulls from our objects/arrays.
//
// As an additional feature: if you pass a function as the "then"/"or" value
// then this function will only be interpretted after the ifElse has run. This
// can be handy for values that require some complex initialization process.
// e.g. ifDev(() => 'lazy', 'not lazy');
export function ifElse(condition) {
  return function ifElseResolver(then, or) {
    const execIfFuc = x => typeof x === 'function' ? x() : x
    return condition ? execIfFuc(then) : or
  }
}

export function getPackageJson() {
  return JSON.parse(
    readFileSync(resolvePath(appRootDir.get(), './package.json'), 'utf-8'),
  )
}

export function exec(command) {
  execSync(command, { stdio: 'inherit', cwd: appRootDir.get() })
}
