This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## 1. Getting Started

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

[出自文章](https://www.jianshu.com/p/3d17ee447f0c?utm_campaign) 

### 2. next 文件即路由

在pages文件目录下建立list文件，哪些路由就是`localhost:3000/list`

如果要生成 `http://localhost:3000/list/:id`路由有两种方式

1. 在`list`目录下添加一个动态目录即可`[id]`

    <img src="./preview/001.png" width="250px" alt="动态目录" />

2. 自定义`server.js`
修改启动脚本

    ```javascript
    "scripts": {
        "dev": "node server.js"
    },
    ```

* 如下

```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer((req, res) => {
  
    const parsedUrl = parse(req.url, true)
    const { pathname, query } = parsedUrl

    if (pathname === '/a') {
      app.render(req, res, '/b', query)
    } else if (pathname === '/b') {
      app.render(req, res, '/a', query)
    } else {
      handle(req, res, parsedUrl)
    }
  }).listen(3000, err => {
    if (err) throw err
    console.log('> Ready on http://localhost:3000')
  })
})
```

### 3.getInitialProps中初始化数据

```javascript
import React, { Component } from 'react'
import Comp from '@components/pages/index'
import { AppModal, CommonModel } from '@models/combine'

interface IProps {
  router: any
}
class Index extends Component<IProps> {
  static async getInitialProps(ctx) {
    const { req } = ctx
    try {
      // xxxx 获取数据
    } catch (e) {
      console.log(e)
    }
  }
  render() {
    return <Comp />
  }
}

export default Index
```

如果项目中用到了Redux，那么，接口获得的初始化数据需要传递给ctx.req，从而在前台初始化Redux时，才能够将初始数据带过来！！

### 4. _app.js

统一布局处理，错误处理

+ 页面布局
+ 当路由变化时保持页面状态
+ 使用componentDidCatch自定义处理错误

```javascript
import React from 'react'
import App, { Container } from 'next/app'
import Layout from '../components/Layout'
import '../styles/index.css'

export default class MyApp extends App {

    componentDidCatch(error, errorInfo) {
        console.log('CUSTOM ERROR HANDLING', error)
        super.componentDidCatch(error, errorInfo)
    }

    render() {
        const { Component, pageProps } = this.props
        return (
            <Container>
                <Layout>
                    <Component {...pageProps} />
                </Layout>
            </Container>)
    }
}
```

### 5. document.js

_document.js 用于初始化服务端时添加文档标记元素，比如自定义meta标签

```javascript

import Document, {
  Head,
  Main,
  NextScript,
} from 'next/document'
import * as React from 'react'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  props

  render() {
    return (
      <html>
        <Head>
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge, chrome=1" />
          <meta name="renderer" content="webkit|ie-comp|ie-stand" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no,viewport-fit=cover"
          />
          <meta name="keywords" content="Next.js demo" />
          <meta name="description" content={'This is a next.js demo'} />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    )
  }
}
```

### 4. 路由

如果通过<Link href={href}></Link>或者<a href={href}></a>做路由跳转，那么，目标页面一定是全渲染，执行getInitialProps钩子函数。
浅层路由允许改变 URL但是不执行getInitialProps 生命周期。可以加载相同页面的 URL，得到更新后的路由属性pathname和query，并不失去 state 状态。

因为浅路由不会执行服务端初始化数据函数，所以服务端返回HTML的速度加快，但是，返回的为空内容，不适合SEO。并且，你需要在浏览器钩子函数componentDidMount 中重新调用接口获得数据再次渲染内容区。

浅路由模式比较适合搜索页面，比如，每次的搜索接口都是按照keyword参数发生变化：
/search?keyword=a 到/search?keyword=b