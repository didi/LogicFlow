---
nav: Guide
group:
  title: Plug-in functionality
  order: 3
title: Snapshot
order:  6
toc: content
---

We often need to export the canvas content as an image. LogicFlow provides an independent plug-in package `Snapshot` to support exporting the canvas as an image.

## Usage

### Registration

Like other LogicFlow plugins, Snapshot supports both global and local registration:

```tsx | pure
import LogicFlow from "@logicflow/core";
import { Snapshot } from "@logicflow/extension";

// Global Registration: Available for all LogicFlow instances
LogicFlow.use(Snapshot);

// Local Registration: Only available for the current instance
const lf = new LogicFlow({
  ...config,
  plugins: [Snapshot]
});
```

### Basic Usage

After registering the plugin, you can directly call the export method through the LogicFlow instance:

```tsx | pure
// Export as PNG image and download
lf.getSnapshot('Flowchart');
```

## Features

In version 2.0, we have comprehensively upgraded the export functionality:

- **Multiple Format Support**: PNG, JPEG, SVG, and other formats
- **Custom Background and Padding**: Adjust image effects according to requirements
- **Partial Rendering**: Option to export only the visible area, improving efficiency
- **Custom Styles**: Support for adding CSS styles to ensure consistent export image style

### Configuration Options

The export method supports the `toImageOptions` parameter with the following configuration options:

| Property Name   | Type    | Default Value | Description                                                                                                             |
| --------------- | ------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- |
| fileType        | string  | png           | Export format: `png`, `webp`, `jpeg`, `svg`                                                                             |
| width           | number  | -             | Image width (may cause image stretching)                                                                                |
| height          | number  | -             | Image height (may cause image stretching)                                                                               |
| backgroundColor | string  | -             | Background color, transparent by default                                                                                |
| quality         | number  | 0.92          | Image quality, only effective for `jpeg` and `webp`, value range 0-1                                                    |
| padding         | number  | 40            | Inner margin, in pixels                                                                                                 |
| partial         | boolean | false         | Whether to export only the visible area                                                                                 |
| safetyFactor    | number  | 1.1           | Safety factor: for wide canvas scenarios, enlarges the export bounds proportionally to ensure all elements are included |
| safetyMargin    | number  | 40            | Safety margin: extra margin for wide canvas scenarios to avoid cropping                                                 |

:::warning{title=Notes}
- SVG format does not support `width`, `height`, `backgroundColor`, `padding` attributes
- Custom width and height may cause image stretching, also affecting padding
- During export, the canvas will automatically handle wide canvas situations, adding safety factors and extra margins
- During export, silent mode will be automatically enabled, disabling canvas interaction
- Automatically converts relative path images in SVG to Base64 encoding <Badge type="warning">2.0.14 New</Badge>
- When the image exceeds the browser's canvas limit, it will automatically scale the image size to ensure successful export, but it will affect image clarity
- You can fine-tune wide canvas behavior via `safetyFactor` and `safetyMargin` to avoid element cropping
- If `partial` is not explicitly provided, it defaults to the current canvas partial rendering state; during export, the rendering mode may be temporarily switched and will be restored afterward
- Anchors and rotate controls are automatically removed during export to prevent auxiliary elements from appearing in the image
:::

### Custom CSS Styles

To keep the exported image consistent with the canvas effect, the plugin loads all CSS rules of the page by default. If you encounter cross-domain issues, you can:

```tsx | pure
// Disable global CSS rules
lf.extension.snapshot.useGlobalRules = false;
// Add custom styles (higher priority)
lf.extension.snapshot.customCssRules = `
  .uml-wrapper {
    line-height: 1.2;
    text-align: center;
    color: blue;
  }
`
```

## API Reference

### getSnapshot
Export image and download
```tsx | pure
lf.getSnapshot(name: string, toImageOptions?: ToImageOptions)
```

### getSnapshotBlob
Get Blob object
```tsx | pure
lf.getSnapshotBlob(backgroundColor?: string, fileType?: string): Promise<{ data: Blob; width: number; height: number }>
// Supported syntax after version 2.0.14👇🏻
lf.getSnapshotBlob(
  backgroundColor?: string, // Compatible with old syntax, will be used as fallback for toImageOptions.backgroundColor
  fileType?: string, // Compatible with old syntax, will be used as fallback for toImageOptions.fileType
  toImageOptions?: ToImageOptions // New parameter
)
```

### getSnapshotBase64
Get Base64 string
```tsx | pure
lf.getSnapshotBase64(backgroundColor?: string, fileType?: string): Promise<{ data: string; width: number; height: number }>
// Supported syntax after version 2.0.14👇🏻
lf.getSnapshotBase64(
  backgroundColor?: string, // Compatible with old syntax, will be used as fallback for toImageOptions.backgroundColor
  fileType?: string, // Compatible with old syntax, will be used as fallback for toImageOptions.fileType
  toImageOptions?: ToImageOptions // New parameter
)
```

## Usage Examples

### Demonstration

<code id="react-portal" src="@/src/tutorial/extension/snapshot"></code>

### Code Examples

**Basic Usage: Export as PNG image and download**
```tsx | pure
lf.getSnapshot('Flowchart');
```

**Advanced Usage: Specify format, background color, and other options**
```tsx | pure
lf.getSnapshot('Flowchart', {
  fileType: 'png',        // Options: 'png', 'webp', 'jpeg', 'svg'
  backgroundColor: '#f5f5f5',
  padding: 30,           // Inner margin, in pixels
  partial: false,        // false: export all elements, true: only export visible area
  quality: 0.92          // Effective for jpeg and webp formats, value range 0-1
})
```

**Export as SVG format**
```tsx | pure
lf.getSnapshot('Flowchart', {
  fileType:'svg'
  // Note: svg format does not support width, height, backgroundColor, padding attributes
});
```

**Get Blob object for further processing**
```tsx | pure
const { data: blob, width, height } = await lf.getSnapshotBlob({
  fileType: 'jpeg',
  backgroundColor: '#ffffff',
  quality: 0.8
})
// Use Blob object to create temporary URL (e.g., for preview)
const blobUrl = URL.createObjectURL(blob);
try {
  // Use blobUrl, e.g., set as image source
  document.getElementById('preview').src = blobUrl;
} finally {
  // Release URL after use
  URL.revokeObjectURL(blobUrl);
}
```

**Get Base64 string for further processing**
```tsx | pure
const { data: base64 } = await lf.getSnapshotBase64({
  fileType: 'png',
  partial: true // Only export visible area
});
// Use Base64 directly for img tag
document.getElementById('preview').src = base64;
```

**Custom CSS Styles**
```tsx | pure
lf.extension.snapshot.useGlobalRules = false; // Disable global CSS rules to avoid cross-domain issues
lf.extension.snapshot.customCssRules = `
  .node-container { border: 2px solid blue; }
  .edge-text { font-weight: bold; }
  .lf-node-text { font-size: 14px; font-weight: bold; }
`;
```
**Using in Components**
```tsx | pure
const downloadSnapshot = async () => {
  // Export as image and download
  await lf.getSnapshot('Flowchart', {
    fileType: 'png',
    backgroundColor: '#ffffff',
    padding: 40
  });
};
```

**Using in Button Click Events**
```tsx | pure
// Using in button click events
document.getElementById('download-btn').addEventListener('click', async () => {
  // Show loading state
  showLoading();
  try {
    // Export image (will automatically apply silent mode and other optimizations)
    await lf.getSnapshot('Flowchart');
  } finally {
    // Hide loading state
    hideLoading();
  }
});
```

**Export and Upload to Server**

```tsx | pure
// Export as Blob and upload to server
async function exportAndUpload() {
  const { data: blob } = await lf.getSnapshotBlob({
    fileType: 'png',
    backgroundColor: '#ffffff'
  });
  
  const formData = new FormData();
  formData.append('file', blob, 'flowchart.png');
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    const result = await response.json();
    console.log('Upload successful:', result);
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

## Other Export Types

### xml <Badge>1.0.7 New</Badge>

The default data generated by LogicFlow is in json format. Some process engines may require the front end to provide data in xml format. `@logicflow/extension` provides two plugins, `lfJson2Xml` and `lfXml2Json`, for converting json and xml to each other.

```jsx | pure
import LogicFlow from "@logicflow/core";
import { lfJson2Xml, lfXml2Json } from "@logicflow/extension";

const data = {
  // ...
};

const lf = new LogicFlow({
  // ...
});

lf.render(data);

// json -> xml
const xml = lfJson2Xml(lf.getGraphData());

// xml -> json
const jsonData = lfXml2Json(xml)
```
