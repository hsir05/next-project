import React, { Fragment } from 'react';
import Link from 'next/link';
import './index.less';

import { Button } from 'antd';

const Home = () => (
    <Fragment>
        
        <h1>欢迎来到next</h1>

        {/* Link内需要a标签，不然爬虫识别不了，不用a可以加passHref，提高爬虫识别率 */}

        <Link href="/user" passHref>
            <Button type="primary">用户列表页</Button>
        </Link>

    </Fragment>
);
export default Home;