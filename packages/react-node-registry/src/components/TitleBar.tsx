import React, { useEffect, useRef, useState } from 'react'
import { BaseNodeModel, GraphModel } from '@logicflow/core'
import { isNumber } from 'lodash-es'

export type TitleBarProps = {
  node: BaseNodeModel
  graph: GraphModel
}

export const TitleBar: React.FC<TitleBarProps> = ({ node, graph }) => {
  const props: any = node?.properties || {}
  const icon = props._icon
  const title = props._title || ''
  const expanded = !!props._expanded
  const titleHeight = isNumber(props._titleHeight) ? props._titleHeight : 28
  const actProps = props._titleActions || []
  const privActs = (node as any).__actions || []
  const actions =
    Array.isArray(privActs) && privActs.length > 0 ? privActs : actProps
  const showMoreAction = Array.isArray(actions) && actions.length > 0
  const trigger = props.titleTrigger === 'hover' ? 'hover' : 'click'
  const [showTooltip, setShowTooltip] = useState(false)
  const moreBtnRef = useRef<HTMLButtonElement | null>(null)
  const tooltipRef = useRef<HTMLDivElement | null>(null)

  const toggleExpand = () => {
    const cur = !!node?.properties?._expanded
    node?.setProperty('_expanded', !cur)
  }

  const runAction = (act: any) => {
    const fn =
      act?.callback ||
      (privActs || []).find((a: any) => a?.name === act?.name)?.callback
    typeof fn === 'function' && fn(node, graph)
  }

  useEffect(() => {
    if (trigger === 'hover') {
      const mb = moreBtnRef.current
      const tt = tooltipRef.current
      const onEnter = () => setShowTooltip(true)
      const onLeave = () => setShowTooltip(false)
      mb?.addEventListener('mouseenter', onEnter)
      mb?.addEventListener('mouseleave', onLeave)
      tt?.addEventListener('mouseenter', onEnter)
      tt?.addEventListener('mouseleave', onLeave)
      return () => {
        mb?.removeEventListener('mouseenter', onEnter)
        mb?.removeEventListener('mouseleave', onLeave)
        tt?.removeEventListener('mouseenter', onEnter)
        tt?.removeEventListener('mouseleave', onLeave)
      }
    }
    const onDoc = (e: MouseEvent) => {
      const mb = moreBtnRef.current
      const tt = tooltipRef.current
      const t = e.target as Node
      if (showTooltip && mb && tt && !mb.contains(t) && !tt.contains(t)) {
        setShowTooltip(false)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [trigger, showTooltip])

  return (
    <div
      className={
        expanded
          ? 'lf-vue-node-title lf-vue-node-title-expanded'
          : 'lf-vue-node-title'
      }
      style={{ height: expanded ? titleHeight : 18 }}
      title={title}
    >
      <div className="lf-vue-node-title-left">
        {icon ? <i className="lf-vue-node-title-icon">{icon}</i> : null}
        <span className="lf-vue-node-title-text">{title}</span>
      </div>
      <div className="lf-vue-node-title-actions">
        <button
          className="lf-vue-node-title-expand"
          onClick={(e) => {
            e.stopPropagation()
            toggleExpand()
          }}
        >
          <svg
            width={14}
            height={12}
            viewBox="0 0 14 12"
            xmlns="http://www.w3.org/2000/svg"
            className="lf-vue-node-title-expand-icon"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            <path
              d="M0.5201124,5.47988755C0.23603013,5.7639699,0.24460429,6.2271326,0.53900635,6.5005059L6.3195491,11.8681526C6.7032304,12.2244282,7.2967696,12.2244282,7.6804514,11.8681526L13.460994,6.5005059C13.755396,6.2271326,13.76397,5.7639699,13.479888,5.47988755C13.211547,5.21154633,12.779465,5.20215771,12.499721,5.45858961L7.3378625,10.1902928C7.1467018,10.3655233,6.8532982,10.3655233,6.6621375,10.1902928L1.5002797,5.45858967C1.2205358,5.20215771,0.78845364,5.21154633,0.5201124,5.47988755Z"
              fill="#474747"
            />
            <path
              d="M0.5201124,0.47988755C0.23603013,0.7639699,0.24460429,1.2271326,0.53900635,1.5005059L6.3195491,6.8681526C6.7032304,7.2244282,7.2967696,7.2244282,7.6804514,6.8681526L13.460994,1.5005059C13.755396,1.2271326,13.76397,0.7639699,13.479888,0.47988755C13.211547,0.21154633,12.779465,0.20215771,12.499721,0.45858961L7.3378625,5.1902928C7.1467018,5.3655233,6.8532982,5.3655233,6.6621375,5.1902928L1.5002797,0.45858967C1.2205358,0.20215771,0.78845364,0.21154633,0.5201124,0.47988755Z"
              fill="#9B9B9B"
            />
          </svg>
        </button>
        {showMoreAction && (
          <button
            ref={moreBtnRef}
            className="lf-vue-node-title-more"
            onClick={(e) => {
              e.stopPropagation()
              if (trigger === 'click') setShowTooltip(!showTooltip)
            }}
          >
            <i className="lf-vue-node-title-more-icon">⋯</i>
          </button>
        )}
        {showMoreAction && (
          <div
            ref={tooltipRef}
            className="lf-vue-node-title-tooltip"
            style={{
              opacity: showTooltip ? 1 : 0,
              pointerEvents: showTooltip ? 'auto' : 'none',
            }}
          >
            <div className="lf-vue-node-title-tooltip-list">
              {actions.map((act: any, idx: number) => (
                <div
                  key={idx}
                  className="lf-vue-node-title-tooltip-item"
                  onClick={(e) => {
                    e.stopPropagation()
                    runAction(act)
                  }}
                >
                  {act?.name || ''}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TitleBar
