---
title: LogicFlow Edge Drawing and Interaction
order: 3
toc: content
---

LogicFlow Edge Drawing and Interaction

## Preface
[LogicFlow](https://github.com/didi/LogicFlow/) is a business-focused framework for visualizing and editing flowcharts (referred to as LF for short). Previously, we introduced the overall [design](https://juejin.cn/post/6933413834682007560) and extension [mechanism](https://juejin.cn/post/6938319455529369636) of LF. Today, let's talk about a core concept in flowcharts - Edges.

In LF, flowchart elements are mainly composed of nodes and edges. Edges play the role of connecting nodes. Different scenarios require different layout and aesthetics for the graph. Currently, LF provides three types of lines: straight lines, orthogonal polylines, and smooth curves, to meet various needs. As shown in the figure below.

![line](https://github.com/didi/LogicFlow/assets/27529822/8a95dd1b-b227-420b-a34c-342865455b76)

Additionally, basic edge functionalities include path drawing, arrows, labels, and to enrich interactions, it includes selection and adjustments. In this article, we will introduce the implementation of drawing straight lines, orthogonal polylines, and smooth curves, setting edge labels, expanding the clickable region, indicating selection status, adjusting positions, and modifying styles.

To facilitate understanding, let's first explain some terms and functionalities.
**Drawing**: Creating the shape of the line.
**Expanding the clickable region**: Usually, edges have a small width (1 - 2px), making precise clicking for selection challenging. By expanding the clickable region, edges become easier to select with the mouse.
**Selection status indication**: Distinguishing selected edges from others.
**Position adjustment**: Edge creation is done by connecting through anchor points and automatically calculating their paths. However, automatic calculations may have some limitations. Manual adjustment can be applied to achieve optimal visual results.
**Edge labeling**: Adding labels to edges to express additional information.
**Style adjustment**: LF provides default styles for edges, such as color #000000 and width 2px. However, different host systems may require different styles. LF offers methods for style adjustments to meet these diverse requirements.

LF supports three types of edges: straight lines, orthogonal polylines, and smooth curves. We will introduce their implementation one by one.

## Straight Lines
Two points determine a straight line; only the starting and ending points are needed to draw a straight line. In LF, SVG's `<line/>` is used for drawing straight lines.

![apply](https://github.com/didi/LogicFlow/assets/27529822/b7a159ec-b6ed-449c-a0e8-c91f85241066)

Expanding the clickable region is achieved by adding a rectangle to the straight line. A point perpendicular to the line and at a distance of 10 from each endpoint is calculated. Then, points 5 units away from these perpendicular points and vertically aligned with the line's two sides are computed. This process results in 4 points forming a rectangle. Since the calculation provides 4 points' coordinates, the <path> tag is used for rendering. Currently, straight lines do not support starting position adjustments.

![line_clickable](https://github.com/didi/LogicFlow/assets/27529822/17df92e8-8e31-45d4-b77b-99bc0c5c2e70)

> The purple area represents the expanded clickable region of the straight line.

PS: Why set offset to 10 instead of 0, or why not achieve it by increasing the width (stroke-width) of the drawn shape? Considering that edge start and end position adjustments, as well as other extended features, may be required, this method offers more flexibility and control.

## Orthogonal Polylines
If two points are connected only by a straight line in a complex graph with many nodes, crossings and overlaps between edges and nodes may occur. To express relationships between nodes more clearly, LF supports orthogonal polylines to connect two nodes.
In LF, orthogonal polylines are drawn using the `<polyline>` tag in SVG. The key step is to find the points that make up the polyline. To enhance aesthetics, the strategy is to avoid intersections and overlaps between edges and node borders as much as possible.
First, let's assume that we are connecting two nodes using the anchor points Start -> End. The calculation for finding the points forming the orthogonal polyline's path is explained using the example shown below.

![orth_polyline](https://github.com/didi/LogicFlow/assets/27529822/ca4f8770-eed4-4bde-a43b-38bf3024b1c6)

Step 1: Calculate the points perpendicular to Start and End as shown in the figure. Find the point on SBbox that is 100 units away from Start along the normal line, and on that point, find the point that is 100 units away from the normal line, perpendicular to Start. This point is the next point after Start, and it is called StartNext. Similarly, find the point EndPre after End. This process results in four points: [Start, StartNext, EndPre, End], which form the path for the orthogonal polyline.

![points1](https://github.com/didi/LogicFlow/assets/27529822/0cef701e-0ceb-4bdd-8270-63ef096e1b1e)

Step 2: Name the box that contains the line containing StartNext and EndPre as LBox, the box containing SBbox and LBox as SLBbox, and the box containing EBbox and LBox as ELBbox. Take the points on the four corners of SLBbox and ELBbox, represented by the blue points in the figure. These points represent the possible points the polyline could go through. The points obtained in this step are shown in the figure as [Blue points].

![points2](https://github.com/didi/LogicFlow/assets/27529822/3a35a287-eb71-49f7-9403-f8a066b2e2ff)

Step 3: Find the midpoint of StartNext and EndPre, represented by the green point in the figure. On the X and Y axes, find the intersections of the line and LBbox, SLBbox, and ELBbox, but not on SBbox and EBbox. These points are represented by the purple points in the figure. These points are the possible points the polyline could go through. The points obtained in this step are shown in the figure as [Purple points].

![points3](https://github.com/didi/LogicFlow/assets/27529822/f970ff32-ec72-4442-81f2-ec622d71ccdf)

Step 4: Summarize the points obtained in the previous three steps, and then remove duplicate points with the same coordinates. The result is shown in the figure as [Red points]. The next step is to find the optimal path between StartNext and EndPre.

![points4](https://github.com/didi/LogicFlow/assets/27529822/b66c616d-42dc-474e-b11d-6a98e2e244d1)

Step 5: Use the [A*](https://en.wikipedia.org/wiki/A*_search_algorithm) algorithm combined with the [Manhattan](https://en.wikipedia.org/wiki/Taxicab_geometry) distance to calculate the path, resulting in the path shown in the figure.

![points5](https://github.com/didi/LogicFlow/assets/27529822/f9dc1daa-8f8d-4bad-b8ce-cf48206236a9)

Step 6: Filter out the intermediate nodes on the same straight line, resulting in the points shown below, and connect them to form the polyline. At this point, the path of the orthogonal polyline is drawn.

![find_path](https://github.com/didi/LogicFlow/assets/27529822/f67d063b-5232-4bb2-a1c7-154993871dd8)

The above describes the method of calculating the path when there is a certain distance between two nodes, and SBbox and EBbox do not overlap. This is the scenario encountered in most diagram drawings. When the two nodes are close to each other, other simpler strategies are used to implement orthogonal polylines. This will not be detailed in this article. The implementation of expanding the clickable region for orthogonal polylines is done by dividing the polyline into multiple line segments and applying the same method as the straight line. For detailed information, please refer to the section on straight lines. An example is shown below:

![polyline_clickable](https://github.com/didi/LogicFlow/assets/27529822/0a6d835e-3334-4677-a15f-e936424c7c28)

> The purple area represents the expanded clickable region of the orthogonal polyline.

By processing the polyline into multiple segments, it also facilitates the adjustment of the polyline's position. Currently, LF supports horizontal/vertical movement adjustments for each segment of the polyline.

The position adjustment of the polyline is implemented by recalculating the path in real-time based on the movement position. The steps are as follows:
Step 1: Calculate the coordinates of the two endpoints of the current line segment after dragging.
Step 2: Calculate the intersection points between the line segment after dragging and the node border.
- If the line segment did not connect to the start or end point before dragging, the removed part of the line segment would intersect inside the node. The closest point of the entire node to the line segment is taken as the intersection point.
- If the line segment was connected to the start point, check whether the endpoint is on the node. If it is not on the node, change the start point to the intersection point between the line segment and the node.
- If the line segment was connected to the end point, check whether the endpoint is on the node. If it is not on the node, change the end point to the intersection point between the line segment and the node.

Step 3: After adjusting to the corresponding border position, find the accurate intersection points between the current line segment and the shape, and update the path.
Below is an example of vertical downward adjustment of a rectangle and a circle. The adjustment effect is as follows:

![adjustment](https://github.com/didi/LogicFlow/assets/27529822/9f1b9b91-4df6-4d76-9994-618afbaac59d)

## Smooth Curves
LF also provides the option to draw curves as edges. LF is based on SVG for drawing, and SVG's <path> tag natively supports Bézier curves. To reduce computations, LF's smooth curves are implemented based on Bézier curves. Bézier curves can be drawn based on four arbitrary coordinates, consisting of a starting point, an ending point, and two middle control points that are mutually separated. By controlling these four points, you can create and edit smooth curves. In LF, you can adjust the shape of curves by moving the positions of two control points.

![cubic_bezier](https://github.com/didi/LogicFlow/assets/27529822/ff343012-0c54-4366-8ff2-68c05ea67a54)

To draw a Bézier curve, you need to calculate the coordinates of the four control points on the curve: the start point, the end point, and the two control points in between. The position adjustment of the curve is done manually by dragging the control points. These points are recalculated in real-time to update the path.

Step 1: Calculate the coordinates of the node's bounding box:
- Center X coordinate
- Center Y coordinate
- Maximum X-axis coordinate
- Minimum X-axis coordinate
- Maximum Y-axis coordinate
- Minimum Y-axis coordinate

Step 2: Calculate the coordinates of the bounding box at an offset of 100 from the node's bounding box:
- Center X coordinate
- Center Y coordinate
- Maximum X-axis coordinate
- Minimum X-axis coordinate
- Maximum Y-axis coordinate
- Minimum Y-axis coordinate

Step 3: Determine the direction (horizontal/vertical) between the center point and the starting point. On the same direction as the center point and starting point, calculate the support point at a distance of 100 from the starting point. This support point lies on the bounding box calculated in Step 2. Based on the given example, take the point from the node's bounding box with coordinates (x: Maximum X-axis coordinate, y: Center Y coordinate) as the support point. The same approach can be used to calculate the support point for the ending point. This method is similar to finding StartNext and EndPre in the polyline path.

Step 4: After obtaining the two support points, combine them with the starting and ending points, and use the path tag to draw the curve.

Below is an example of the adjustment of Bézier control points. By moving the control points, the shape of the curve can be modified.

![adjust_controll_points](https://github.com/didi/LogicFlow/assets/27529822/f37c56d6-9254-4cad-953c-62ee080819b0)

Expanding the clickable region of Bézier curves is achieved by drawing a Bézier curve in the same position but with different style properties, as follows:

```js

strokeWidth="10"
stroke="transparent"
fill="none"

```

The expanded region is a Bézier curve with increased width (10 units).

![bezier_clickable](https://github.com/didi/LogicFlow/assets/27529822/94b1cdcd-5cca-46c1-a706-4e2c38f35d19)

> The purple area represents the expanded clickable region of the Bézier curve.

## Arrows
Arrows in flowcharts indicate the direction of flow between flowchart nodes. In LF, arrows for straight lines, orthogonal polylines, and smooth curves are implemented using the same method. In LF, arrows are essentially triangles containing the endpoint. The other two points of the triangle, in addition to the endpoint, need to be calculated.
- Find the tangent vector segment at the end of the edge.
Straight Line: Vector from the start point to the end point.
Orthogonal Polyline: Vector of the last line segment of the polyline.
Smooth Curve: Vector from the endpoint to the control point.
- Calculate the other two points of the triangle.
Take the point at a distance of 10 from the endpoint as the perpendicular point. Calculate the points that are 5 units away from the perpendicular point and are vertically aligned with the edge on both sides. These three points form the arrow. As shown in the figure below, the size of the arrow can be adjusted using the theme style's offset and verticalLength properties.

![arrow](https://github.com/didi/LogicFlow/assets/27529822/6ea8f167-22d0-4c2a-949c-41cd05eb948a)

Currently, LF only supports one-way arrows, and the arrow style is limited to triangles. In the future, more arrow capabilities and styles may be added.

## Selected Indication for Edges
When an edge is selected, it is indicated by a rectangle that can contain all the points of the edge. The coordinates and size information (x, y, width, height) are calculated, and then the rectangle is rendered. The selected indication of edges and nodes are drawn in different SVG layers using LF's MVVM (Model-View-ViewModel) architecture. This allows for flexible rendering based on data, making it easier to handle rendering under different modes and conditions. It also makes it easier to exclude the selected indication layer when exporting images, resulting in a cleaner image. The method of calculating the selected indication for straight lines, orthogonal polylines, and smooth curves is different.

For straight lines, the calculation logic is as follows:

- startPoint: Starting point.
- endPoint: Ending point.

``` js
const x = (startPoint.x + endPoint.x) / 2;
const y = (startPoint.y + endPoint.y) / 2;
const width = Math.abs(startPoint.x - endPoint.x) + 10;
const height = Math.abs(startPoint.y - endPoint.y) + 10;
```

![line_selected](https://github.com/didi/LogicFlow/assets/27529822/d169a666-4f37-41f9-adce-e779a0e85d6c)

For orthogonal polylines, the calculation logic is as follows:

- points: Points of the polyline.

``` js
// bbox: Box that contains all points of the polyline.
const { points } = polyline;
const pointsList = points2PointsList(points);
const bbox = getBBoxOfPoints(pointsList, 8);
const { x, y, width, height } = bbox;
```

![polyline_selected](https://github.com/didi/LogicFlow/assets/27529822/909602bf-d32d-4930-9e30-39fe2be6b74c)

For smooth curves, the calculation logic is as follows:
- pointsList: List of all points on the Bézier curve, including the start point, end point, and two control points.
- bbox: Box that contains all points on the Bézier curve.

``` js
const { path } = bezier;
const pointsList = getBezierPoints(path);
const bbox = getBBoxOfPoints(pointsList, 8);
const { x, y, width, height } = bbox;
```

![bezier_selected](https://github.com/didi/LogicFlow/assets/27529822/50760129-295e-42de-904c-b28e69841eb5)

## Edge Labeling
Adding labels to edges can enrich the information conveyed in the diagram. In LF, you can double-click on an edge to enable the text editing mode. The default position for the label is as follows:

- Straight Line: The middle point of the line.
- Orthogonal Polyline: When manually adding the label, it is the perpendicular point to the double-click position on the polyline with the shortest distance. When added automatically (non-double-click), it is the middle point of the longest line segment in the polyline.
- Smooth Curve: The average of the X and Y coordinates of the start point, end point, and two control points.
Of course, the label position can also be manually adjusted by dragging.

## Style Adjustment
For detailed information about adjusting the style of edges, you can refer to the official documentation on [Theme](/en/tutorial/basic-theme).

## Conclusion
By reading this article, you should have a general understanding of how edges are implemented in LogicFlow. While developing LogicFlow, we encountered many non-pure front-end issues, which required us to revisit geometry, algorithms, and other related knowledge. If you are also interested in these aspects or have research experience, we welcome you to join the discussion. Currently, the LogicFlow user group has more than 200 members who are all discussing flow visualization and LowCode-related implementations. We look forward to your participation!

> To join the user group on WeChat: logic-flow
