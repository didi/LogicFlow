import LogicFlow from '@logicflow/core'
import { useEffect, useRef, useState } from 'react'
import { Snapshot, DndPanel } from '@logicflow/extension'

import {
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Row,
  Space,
  Select,
  Input,
} from 'antd'
import ImageNode from './imageNode'
import Uml from './uml'
import data from './data'

import styles from './index.less'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const config: Partial<LogicFlow.Options> = {
  isSilentMode: false,
  stopScrollGraph: false,
  stopZoomGraph: false,
  stopMoveGraph: false,
  style: {
    rect: {
      rx: 5,
      ry: 5,
      strokeWidth: 2,
    },
    circle: {
      fill: '#f5f5f5',
      stroke: '#666',
    },
    ellipse: {
      fill: '#dae8fc',
      stroke: '#6c8ebf',
    },
    polygon: {
      fill: '#d5e8d4',
      stroke: '#82b366',
    },
    diamond: {
      fill: '#ffe6cc',
      stroke: '#d79b00',
    },
    text: {
      color: '#b85450',
      fontSize: 12,
    },
  },
  grid: {
    size: 20,
  },
}

interface SnapshotResponse {
  data: Blob
  width: number
  height: number
}

/**
 * 框选插件 Snapshot 示例
 */
export default function SnapshotExample() {
  const lfRef = useRef<LogicFlow>()
  const containerRef = useRef<HTMLDivElement>(null)

  const [fileName, setFileName] = useState<string>() // 文件名
  const [fileType, setFileType] = useState<string>('png') // 下载的图片类型
  const [width, setWidth] = useState<string>() // 宽度
  const [height, setHeight] = useState<string>() // 高度
  const [padding, setPaddding] = useState<string>() //padding

  const [blobData, setBlobData] = useState('')
  const [base64Data, setBase64Data] = useState('')

  // 初始化 LogicFlow
  useEffect(() => {
    if (!lfRef.current) {
      const lf = new LogicFlow({
        ...config,
        container: containerRef.current!,
        plugins: [Snapshot, DndPanel],
      })

      lf.register(Uml)
      lf.register(ImageNode)

      lf.on(
        'selection:selected-area',
        ({ topLeft, bottomRight }: Record<string, LogicFlow.PointTuple>) => {
          console.log('get selection area:', topLeft, bottomRight)
        },
      )

      lf.setPatternItems([
        {
          type: 'circle',
          text: 'circle',
          label: 'circle',
          icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAAH6ji2bAAAABGdBTUEAALGPC/xhBQAAAnBJREFUOBGdVL1rU1EcPfdGBddmaZLiEhdx1MHZQXApraCzQ7GKLgoRBxMfcRELuihWKcXFRcEWF8HBf0DdDCKYRZpnl7p0svLe9Zzbd29eQhTbC8nv+9zf130AT63jvooOGS8Vf9Nt5zxba7sXQwODfkWpkbjTQfCGUd9gIp3uuPP8bZ946g56dYQvnBg+b1HB8VIQmMFrazKcKSvFW2dQTxJnJdQ77urmXWOMBCmXM2Rke4S7UAW+/8ywwFoewmBps2tu7mbTdp8VMOkIRAkKfrVawalJTtIliclFbaOBqa0M2xImHeVIfd/nKAfVq/LGnPss5Kh00VEdSzfwnBXPUpmykNss4lUI9C1ga+8PNrBD5YeqRY2Zz8PhjooIbfJXjowvQJBqkmEkVnktWhwu2SM7SMx7Cj0N9IC0oQXRo8xwAGzQms+xrB/nNSUWVveI48ayrFGyC2+E2C+aWrZHXvOuz+CiV6iycWe1Rd1Q6+QUG07nb5SbPrL4426d+9E1axKjY3AoRrlEeSQo2Eu0T6BWAAr6COhTcWjRaYfKG5csnvytvUr/WY4rrPMB53Uo7jZRjXaG6/CFfNMaXEu75nG47X+oepU7PKJvvzGDY1YLSKHJrK7vFUwXKkaxwhCW3u+sDFMVrIju54RYYbFKpALZAo7sB6wcKyyrd+aBMryMT2gPyD6GsQoRFkGHr14TthZni9ck0z+Pnmee460mHXbRAypKNy3nuMdrWgVKj8YVV8E7PSzp1BZ9SJnJAsXdryw/h5ctboUVi4AFiCd+lQaYMw5z3LGTBKjLQOeUF35k89f58Vv/tGh+l+PE/wG0rgfIUbZK5AAAAABJRU5ErkJggg==',
        },
        {
          type: 'rect',
          label: 'rect',
          text: 'circle',
          icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAATCAYAAAEFVwZaAAAABGdBTUEAALGPC/xhBQAAAqlJREFUOBF9VM9rE0EUfrMJNUKLihGbpLGtaCOIR8VjQMGDePCgCCIiCNqzCAp2MyYUCXhUtF5E0D+g1t48qAd7CCLqQUQKEWkStcEfVGlLdp/fm3aW2QQdyLzf33zz5m2IsAZ9XhDpyaaIZkTS4ASzK41TFao88GuJ3hsr2pAbipHxuSYyKRugagICGANkfFnNh3HeE2N0b3nN2cgnpcictw5veJIzxmDamSlxxQZicq/mflxhbaH8BLRbuRwNtZp0JAhoplVRUdzmCe/vO27wFuuA3S5qXruGdboy5/PRGFsbFGKo/haRtQHIrM83bVeTrOgNhZReWaYGnE4aUQgTJNvijJFF4jQ8BxJE5xfKatZWmZcTQ+BVgh7s8SgPlCkcec4mGTmieTP4xd7PcpIEg1TX6gdeLW8rTVMVLVvb7ctXoH0Cydl2QOPJBG21STE5OsnbweVYzAnD3A7PVILuY0yiiyDwSm2g441r6rMSgp6iK42yqroI2QoXeJVeA+YeZSa47gZdXaZWQKTrG93rukk/l2Al6Kzh5AZEl7dDQy+JjgFahQjRopSxPbrbvK7GRe9ePWBo1wcU7sYrFZtavXALwGw/7Dnc50urrHJuTPSoO2IMV3gUQGNg87IbSOIY9BpiT9HV7FCZ94nPXb3MSnwHn/FFFE1vG6DTby+r31KAkUktB3Qf6ikUPWxW1BkXSPQeMHHiW0+HAd2GelJsZz1OJegCxqzl+CLVHa/IibuHeJ1HAKzhuDR+ymNaRFM+4jU6UWKXorRmbyqkq/D76FffevwdCp+jN3UAN/C9JRVTDuOxC/oh+EdMnqIOrlYteKSfadVRGLJFJPSB/ti/6K8f0CNymg/iH2gO/f0DwE0yjAFO6l8JaR5j0VPwPwfaYHqOqrCI319WzwhwzNW/aQAAAABJRU5ErkJggg==',
        },
      ])

      lf.extension.snapshot.useGlobalRules = false
      lf.extension.snapshot.customCssRules = `
          .uml-wrapper {
            line-height: 1.2;
            text-align: center;
            color: blue;
          }
        `

      lf.render(data)
      lf.translateCenter()

      lfRef.current = lf
    }
  }, [])

  const handleGetSnapshot = () => {
    if (lfRef.current) {
      lfRef.current.getSnapshot()
    }
  }

  const handlePreviewSnapshotBlob = () => {
    if (lfRef.current) {
      setBase64Data('')
      lfRef.current
        .getSnapshotBlob('#FFFFFF')
        .then(
          ({
            data,
            width,
            height,
          }: {
            data: Blob
            width: number
            height: number
          }) => {
            setBlobData(window.URL.createObjectURL(data))
            console.log('width, height ', width, height)
          },
        )
    }
  }

  const handlePreviewSnapshotBase64 = () => {
    if (lfRef.current) {
      setBlobData('')
      lfRef.current
        .getSnapshotBase64('#FFFFFF')
        .then(
          ({
            data,
            width,
            height,
          }: {
            data: string
            width: number
            height: number
          }) => {
            setBase64Data(data)
            console.log('width, height ', width, height)
          },
        )
    }
  }
  // 下载
  const downLoad = () => {
    lfRef.current &&
      lfRef.current.getSnapshot(fileName, {
        fileType,
        height: height,
        padding: padding,
        backgroundColor: 'yellow',
        partialElement: true,
        ...(width ? { width } : {}),
        ...(height ? { height } : {}),
        ...(padding ? { padding } : {}),
      })
  }

  // 预览
  // const preview = () => {
  //   lfRef.current &&
  //     lfRef.current
  //       .getSnapshotBlob('#FFFFFF', fileType)
  //       .then(({ data }: SnapshotResponse) => {
  //         if (imgRef.current) {
  //           imgRef.current.width = 500
  //           imgRef.current.height = 400
  //           imgRef.current.src = window.URL.createObjectURL(data)
  //         }
  //       })
  // }

  // 打印base64地址
  const logBase64 = () => {
    lfRef.current &&
      lfRef.current
        .getSnapshotBase64(undefined, fileType)
        .then(({ data, width, height }: SnapshotResponse) => {
          // document.getElementById('img').src = data
          console.log(width, height, data)
        })
  }

  return (
    <Card title="LogicFlow Extension - Snapshot">
      <div style={{ marginBottom: '10px' }}>
        <Space>
          <span>文件名：</span>
          <Input
            placeholder="文件名"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
          />
          <span>文件类型(默认png)：</span>
          <Select
            defaultValue={fileType}
            style={{ width: 120 }}
            onChange={(value) => setFileType(value)}
            options={[
              { value: 'png', label: 'png' },
              { value: 'jpeg', label: 'jpeg' },
              { value: 'webp', label: 'webp' },
              { value: 'gif', label: 'gif' },
            ]}
          />
          <span>宽度</span>
          <Input
            placeholder="width"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
          />
          <span>高度</span>
          <Input
            placeholder="height"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
          />
          <span>padding</span>
          <Input
            placeholder="padding"
            value={padding}
            onChange={(e) => setPaddding(e.target.value)}
          />
          <Button id="download" onClick={downLoad}>
            下载快照
          </Button>
        </Space>
      </div>
      <Divider />
      <Space>
        {/* <Button id="preview" onClick={preview}>
          预览
        </Button> */}
        <Button id="base64" onClick={logBase64}>
          打印base64
        </Button>
      </Space>
      <Divider />
      <Flex wrap="wrap" gap="middle" align="center" justify="space-between">
        <Space>
          <Button onClick={handleGetSnapshot}>下载快照</Button>
          <Button onClick={handlePreviewSnapshotBlob}>预览(blob)</Button>
          <Button onClick={handlePreviewSnapshotBase64}>预览(base64)</Button>
        </Space>
      </Flex>
      <Row>
        <Col span={12}>
          <div ref={containerRef} id="graph" className={styles.viewport}></div>
        </Col>
        <Col span={12}>
          {blobData && (
            <>
              <h2>blobData</h2>
              <img key="blob" src={blobData} className={styles.preview} />
            </>
          )}
          {base64Data && (
            <>
              <h2>base64Data</h2>
              <img key="base64" src={base64Data} className={styles.preview} />
            </>
          )}
        </Col>
      </Row>
    </Card>
  )
}
