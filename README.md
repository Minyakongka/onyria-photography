# Onyria 摄影集：完整源码备份与迁移说明

本包包含当前网站全部 HTML、CSS、JavaScript 和 39 张作品照片及封面。可以独立运行，不依赖本次聊天，不包含账号凭据。

## 文件作用
- index.html：页面标题、介绍、导航、分类按钮。
- style.css：颜色、尺寸、响应式排版。
- content.js：39 张作品的路径、分类、原始尺寸、顺序与随笔内容。
- app.js：分类筛选、按比例排版、栏目折叠、置顶栏与全屏查看。
- assets/：网站实际使用的照片和封面。
- .nojekyll：用于 GitHub Pages 的静态资源部署。

## 本地查看
解压后直接用浏览器打开 index.html 即可查看。不要只保存 index.html，须保留其他文件和 assets 文件夹的相对位置。

## 修改照片
把新照片放进 assets，然后在 content.js 的 photos 数组里加入一个记录；src 使用 assets/文件名，width 和 height 填写真实像素尺寸。category 可选 landscape（云浮岳峙）、sunset（屹岳断霞）、city（城市天际线）、stars（辉光之辰）。title 和 description 留空时无注释；featured:true 表示指定独占一行。分类首图通过调整该分类的照片顺序确定。
宽高比严格大于 16:9 的照片自动独占一行；其他同方向照片两张一行。保留原始比例。
首页静态总数和总数标记在 index.html 中；实际分类数量由 app.js 自动更新。

## 迁移到 GitHub Pages
1. 在自己的 GitHub 账号中建立一个仓库。若使用免费账号，采用公开仓库。
2. 将本包的 index.html、style.css、app.js、content.js、.nojekyll 和 assets 文件夹上传到仓库根目录，保留层级。不要只上传 ZIP，也不要把整个目录嵌套成第二层。
3. 在仓库的 Settings（设置）→ Pages 中，Source 选择 Deploy from a branch，分支选择 main，目录选择 / (root)，然后 Save。
4. 等待部署结束，Pages 设置页面会显示 GitHub 网站地址。以后修改并提交源文件即可更新网站。
本网站使用相对资源路径，可以部署在项目仓库路径下。迁移不会自动搬走或删除原有 Sites 网站；GitHub 会提供另一个地址。

GitHub 官方说明：
https://docs.github.com/en/pages/getting-started-with-github-pages/what-is-github-pages
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## 保管与后续编辑
建议在电脑上保存本包，并在自己的仓库中保存源码。以后可以自己编辑，也可以把本包交给任何开发者或其他 AI 修改。源代码本身不依赖原聊天记录。
本包只包含网站使用的图片副本；摄影原始文件请另行备份。每次更新网站后，更新自己的源码备份。
