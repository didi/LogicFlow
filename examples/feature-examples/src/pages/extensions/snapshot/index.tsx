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

import './index.less'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

const config: Partial<LogicFlow.Options> = {
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
  const [quality, setQuality] = useState<string>() // 图片质量

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

      // 默认开启css样式
      lf.extension.snapshot.useGlobalRules = true
      // 不会覆盖css样式，会叠加，customCssRules优先级高
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

  // 下载
  const downLoad = () => {
    const params = {
      fileType,
      backgroundColor: 'yellow',
      partialElement: true,
      ...(width ? { width: Number(width) } : {}),
      ...(height ? { height: Number(height) } : {}),
      ...(padding ? { padding: Number(padding) } : {}),
      ...(quality ? { quality: Number(quality) } : {}),
    }
    console.log(params, 'params')
    lfRef.current && lfRef.current.getSnapshot(fileName, params)
  }

  // 预览 blob
  const previewBlob = () => {
    if (lfRef.current) {
      setBase64Data('')
      lfRef.current
        .getSnapshotBlob('#FFFFFF', fileType)
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

  // 预览 base64
  const previewBase64 = () => {
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

  return (
    <Card title="LogicFlow Extension - Snapshot">
      <Space>
        <Input
          addonBefore="文件名："
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <span>文件类型：</span>
        <Select
          defaultValue={fileType}
          style={{ width: 120 }}
          onChange={(value) => setFileType(value)}
          options={[
            { value: 'png', label: 'png' },
            { value: 'jpeg', label: 'jpeg' },
            { value: 'webp', label: 'webp' },
            { value: 'gif', label: 'gif' },
            { value: 'svg', label: 'svg' },
          ]}
        />
        <Input
          addonBefore="宽度："
          value={width}
          onChange={(e) => setWidth(e.target.value)}
        />
        <Input
          addonBefore="高度："
          value={height}
          onChange={(e) => setHeight(e.target.value)}
        />
      </Space>
      <p></p>
      <Space>
        <Input
          addonBefore="padding："
          value={padding}
          onChange={(e) => setPaddding(e.target.value)}
        />
        <Input
          addonBefore="图片质量："
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
        />
      </Space>
      <Divider />
      <Space>
        <Button onClick={downLoad}>下载快照</Button>
        <Button onClick={previewBlob}>预览(blob)</Button>
        <Button onClick={previewBase64}>预览(base64)</Button>
      </Space>
      <Divider />
      <Flex align="center" justify="center">
        <div ref={containerRef} className="graph"></div>
      </Flex>
      <Row>
        <Col span={12}>
          {blobData && (
            <>
              <h2>blobData</h2>
              <img key="blob" src={blobData} />
            </>
          )}
          {base64Data && (
            <>
              <h2>base64Data</h2>
              <img key="base64" src={base64Data} />
            </>
          )}
        </Col>
      </Row>
    </Card>
  )
}
