JK_Inc
====

浙江省金控微信H5创业公司调查反馈，邀请码（限用一次）



### 基于

nodejs、mongoose、ejs、nodemailer、grunt

同类产品 ： [hi-blog][2]

Author : [HighSea][1] 

### 安装

	git clone https://github.com/highsea/JK_Inc.git
	cd JK_Inc && npm install
	node app

### 业务逻辑与表结构

![业务逻辑与表结构][3]

### 开发进度

##### v 0.0.1

* 验证邀请码
* 注册（验证信息、成功后发送邮件）
* 密码找回
* 前台问卷调查（后台查看 某个用户[邀请码]对相关公司的兴趣程度）
* 后台管理（设置项目内容标题常用信息、会员、公司的增删改查）
* 会员数据分析
* 文件图片 上传
* session 记录
* 友好错误提示页面
* mongodb 数据库设计


[1]: http://highsea90.com "HighSea的小站"
[2]: https://github.com/highsea/hi-blog "一个 nodejs+express+mongodb 的 cms 系统"
[3]: http://images.cnitblog.com/blog2015/531703/201504/271001351304564.jpg "业务逻辑与表结构"