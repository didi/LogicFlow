import { Outlet } from 'react-router-dom'

export default function Root() {
  return (
    <>
      <div id="sidebar">
        <h1>LogicFlow & Engine Demos</h1>
        <div>
          {/* TODO: 完成路由检索功能 */}
          <form id="search-form" role="search">
            <input
              id="q"
              aria-label="Search contacts"
              placeholder="Press Enter for Search"
              type="search"
              name="q"
            />
            <div id="search-spinner" aria-hidden hidden={true} />
            <div className="sr-only" aria-live="polite"></div>
          </form>
        </div>
        <nav>
          <ul>
            <div className="nav-title">Graph</div>
            <li>
              <a href={`/graph/get-started`}>Get Started</a>
            </li>
            <div className="nav-title">Extension</div>
            <li>
              <a href={`/extension/bpmn`}>BPMN</a>
            </li>
            <div className="nav-title">Engine</div>
            <li>
              <a href={`/engine/get-started`}>Start Engine</a>
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
