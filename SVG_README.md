# react-native-svg for Expo/React Native

This project uses SVG icons. To use SVGs in React Native or Expo, you must install and use the `react-native-svg` package. This is required because React Native does not support standard web SVG elements like `<svg>` and `<path>`.

## Installation

If you are using Expo (recommended for this project structure):

```
expo install react-native-svg
```

If you are using bare React Native:

```
npm install react-native-svg
npx pod-install
```

## Usage

After installing, you can import SVG elements like this:

```js
import Svg, { Path } from 'react-native-svg';
```

Replace all `<svg>` with `<Svg>` and `<path>` with `<Path>` in your components.

---

**Next step:**
I will update your `App.js` to use `react-native-svg` for all icon components.
