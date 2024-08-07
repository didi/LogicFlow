import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
    <>
      <div id="sidebar">
        <h1>LogicFlow Demos</h1>
        <div>
          {/* TODO: 完成路由检索功能 */}
          <form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Press Enter to Search"
              type="search"
              name="q"
            />
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </form>
        </div>
        <nav>
          <ul>
            <div className="nav-title">LogicFlow</div>
            <li>
              <a href={`/graph/get-started`}>Overview</a>
            </li>
            <div className="nav-title">Extension</div>
            <li>
              <a href={`/extension/bpmn`}>BPMN</a>
              <a href={`/extension/label`}>Label</a>
              <a href={`/extension/dynamic-group`}>Dynamic Group</a>
            </li>
            <div className="nav-title">Engine</div>
            <li>
              <a href={`/engine/get-started`}>Get Started</a>
              <a href={`/engine/recorder`}>Recorder</a>
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
