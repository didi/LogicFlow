---
nav: Guide
group:
  title: Basics
  order: 1
title: Theme
order: 3
toc: content
---

LogicFlow provides a way to set the theme, which makes it easy for users to set the style of all elements inside it in a uniform way.
There are two ways to set a theme:

- Initialize `LogicFlow` with the `style` parameter in the configuration
- After initialization, call the `setTheme` method on the `LogicFlow` instance

For detailed theme configuration parameters, see [Theme API](../../api/theme.en.md)

## Theme Configuration Methods

### Way 1: Initialization Configuration

When creating a LogicFlow instance, configure the theme using the `style` parameter.

```tsx | pure
// Method 1: Configure theme through the style parameter
const config = {
  container: document.querySelector('#container'),
  width: 1000,
  height: 800,
  style: { // Set default theme style
    rect: { fill: '#FFFFFF', strokeWidth: 2 }, // Rectangle style
    circle: { r: 15, fill: '#1E90FF' }, // Circle style
    nodeText: { fontSize: 14, color: '#333333' }, // Node text style
    edgeText: { fontSize: 12, color: '#666666' }, // Edge text style
    anchor: { stroke: '#999999', fill: '#FFFFFF' }, // Anchor point style
  },
}
const lf = new LogicFlow(config)
```

### Way 2: Using the setTheme Method

After creating a LogicFlow instance, dynamically update the theme configuration by calling the `setTheme` method.

```tsx | pure
// Method 2: Dynamically configure theme using the setTheme method
lf.setTheme({
  rect: { fill: '#FFFFFF', stroke: '#1890FF' }, // Rectangle style
  circle: { r: 15, fill: '#1890FF' }, // Circle style
  nodeText: { fontSize: 14, color: '#333333' }, // Node text style
  edgeText: { fontSize: 12, color: '#666666' }, // Edge text style
  anchor: { r: 4, fill: '#FFFFFF', stroke: '#1890FF' }, // Anchor point style
})
```

## Built-in Theme Modes

LogicFlow comes with four built-in theme modes that allow you to quickly apply preset styles:

- `default`: Default theme
- `dark`: Dark theme
- `colorful`: Colorful theme
- `radius`: Rounded corner theme

Applying built-in theme modes:

```tsx | pure
// Apply dark theme
lf.setTheme({}, 'dark')

// Apply colorful theme
lf.setTheme({}, 'colorful')

// Apply radius theme with some custom styles
lf.setTheme({
  rect: { fill: '#AECBFA' },
  circle: { fill: '#C9DAF8' }
}, 'radius')
```

## Custom Theme Modes

You can add custom theme modes using the `addThemeMode` method:

```tsx | pure
// Register custom theme mode
lf.addThemeMode('customTheme', {
  baseNode: { fill: '#EFF5FF', stroke: '#4B83FF' },
  rect: { radius: 8 },
  circle: { r: 25 },
  nodeText: { fontSize: 16, color: '#4B83FF' },
  edgeText: { fontSize: 14, background: { fill: '#EEF7FE' } },
  arrow: { offset: 6, verticalLength: 3 },
})

// Apply custom theme
lf.setTheme({}, 'customTheme')
```

## Theme Style Priority

The priority of theme styles (from high to low):
1. Built-in base styles (defaultTheme)
2. Applied theme mode styles (specified via `themeMode` during initialization or as the second parameter of `setTheme`)
3. Custom styles (specified via `style` during initialization or as the first parameter of `setTheme`)

## Usage Example
<code id="graphData" src="../../../src/tutorial/basic/instance/theme"></code>
