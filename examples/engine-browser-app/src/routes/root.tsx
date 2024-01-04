import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
    <>
      <div id="sidebar">
        <h1>LogicFLow Engine Demos</h1>
        <div>
          <form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Search"
              type="search"
              name="q"
            />
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </form>
          <form method="post">
            <button type="submit">New</button>
          </form>
        </div>
        <nav>
          <ul>
            <div className="nav-title">Basic</div>
            <li>
              <a href={`/core/basic-node`}>Basic Node</a>
            </li>
            <li>
              <a href={`/core/rect-node`}>Rect Node</a>
            </li>
            <li>
              <a href={`/core/basic-edge`}>Basic Edge</a>
            </li>
            <li>
              <a href={`/core/layout`}>Layout</a>
            </li>
            <div className="nav-title">Engine</div>
            <li>
              <a href={`/engine/get-started`}>Start Engine</a>
              <a href={`/engine/recorder`}>Recorder</a>
            </li>
            <div className="nav-title">Extension</div>
            <li>
              <a href={`/extension/control`}>Control</a>
              <a href={`/extension/dnd-panel`}>DndPanel</a>
              <a href={`/extension/menu`}>Menu</a>
            </li>
          </ul>
        </nav>
      </div>
      <div id="detail">
        <Outlet />
      </div>
    </>
  )
}
