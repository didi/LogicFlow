import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import Root from './routes/root'
import Home from './pages/Home'
import ErrorPage from './pages/ErrorPage'

// 页面组件
import Graph from './pages/graph'
import Bpmn from './pages/extension/bpmn'
import Label from './pages/extension/label'
import DynamicGroup from './pages/extension/dynamic-group'

import GetStarted from './pages/engine/GetStarted'
import Recorder from './pages/engine/Recorder'

import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/graph',
        children: [
          {
            path: '/graph/get-started',
            element: <Graph />,
          },
        ],
      },
      {
        path: '/extension',
        children: [
          {
            path: '/extension/bpmn',
            element: <Bpmn />,
          },
          {
            path: '/extension/label',
            element: <Label />,
          },
          {
            path: '/extension/dynamic-group',
            element: <DynamicGroup />,
          },
        ],
      },
      {
        path: '/engine',
        children: [
          {
            path: '/engine/get-started',
            element: <GetStarted />,
          },
          {
            path: '/engine/recorder',
            element: <Recorder />,
          },
        ],
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
)
