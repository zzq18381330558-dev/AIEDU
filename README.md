# AI 教育科技业务管理系统

面向在校大学生教师资格证考试培训业务的 Web 管理后台。当前版本完成了可扩展项目骨架、Prisma 数据模型、登录与角色权限、后台布局和六大业务模块入口。

## 技术栈

- 前端：Next.js App Router、React、Tailwind CSS
- 后端：Next.js Server Actions / Server Components
- 数据库：PostgreSQL
- ORM：Prisma
- 权限：服务端 cookie session + RBAC 角色权限

## 目录结构

```text
.
├── prisma
│   ├── schema.prisma        # 数据库模型
│   └── seed.ts              # 初始化组织、校区、角色账号和示例数据
├── src
│   ├── app
│   │   ├── (admin)          # 受保护后台路由
│   │   ├── actions          # Server Actions
│   │   ├── login            # 登录页
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components           # 登录表单、侧边栏、顶部栏、模块页组件
│   └── lib                  # Prisma、session、角色权限、导航配置
├── docker-compose.yml       # 本地 PostgreSQL
├── package.json
└── tailwind.config.ts
```

## 业务模块

- 招生 CRM 系统：线索、跟进、试听、转化
- AI 学员服务系统：学员档案、学习计划、服务工单、AI 学情总结
- AI 题库系统：题库、题目、标签、难度、解析
- 教研内容生产系统：课程大纲、讲义、教案、AI 内容生成与审核
- 数据分析系统：招生转化、服务响应、校区经营指标
- 校区复制 SOP 系统：SOP 模板、步骤、校区执行追踪

## 角色权限

系统内置 6 类角色：

- 管理员：全部模块
- 总部运营：工作台、CRM、学员服务、题库、教研、数据分析、SOP
- 校区负责人：工作台、CRM、学员服务、数据分析、SOP
- 招生老师：招生 CRM
- 教务老师：AI 学员服务、AI 题库、教研内容生产
- 授课老师：AI 题库、教研内容生产

权限配置位于 `src/lib/roles.ts`，导航配置位于 `src/lib/nav.ts`。

## 本地运行

1. 安装依赖

```bash
npm install
```

2. 准备环境变量

```bash
cp .env.example .env
```

3. 启动 PostgreSQL

```bash
docker compose up -d
```

4. 创建数据库表并生成 Prisma Client

```bash
npm run prisma:migrate -- --name init
```

5. 写入种子数据

```bash
npm run db:seed
```

6. 启动开发服务

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)。

## 默认账号

所有默认账号密码均为：

```text
Admin@123456
```

| 角色 | 邮箱 |
| --- | --- |
| 管理员 | admin@aiedu.local |
| 总部运营 | ops@aiedu.local |
| 校区负责人 | campus@aiedu.local |
| 招生老师 | sales@aiedu.local |
| 教务老师 | academic@aiedu.local |
| 授课老师 | lecturer@aiedu.local |

## 后续建议

优先按业务闭环继续建设：

1. CRM 线索列表、线索详情、跟进记录和转学员流程
2. 学员档案、教务工单和 AI 学情总结
3. 题库批量导入、AI 解析生成和组卷练习
4. 教研内容审核流和版本管理
5. 数据指标口径与校区经营看板
6. SOP 模板执行、责任人和验收记录

## 招生 CRM 已实现功能

- 线索列表：支持按姓名、手机号、微信号、学校搜索，按跟进状态和来源渠道筛选
- 线索录入：新增/编辑弹窗覆盖姓名、手机、微信、学校、年级、专业、教资方向、来源渠道、校区、招生老师、意向等级、跟进状态、下次跟进时间和备注
- 线索分配：可将线索分配给招生老师
- 跟进记录：进入线索详情页可新增跟进内容，同步更新意向等级、状态、最近跟进和下次提醒
- 今日提醒：`/crm/reminders` 查看今天需要跟进的线索
- 业绩统计：`/crm/performance` 查看招生老师分配量、联系量、成交量和成交率
- 来源统计：CRM 首页和业绩页展示渠道贡献
- Excel 导入：CRM 首页支持上传 `.xlsx/.xls/.csv`

CRM 数据库变更已放在迁移 `20260522162000_crm_leads` 中。更新到这一版后执行：

```bash
npm install
npm run prisma:migrate
npm run db:seed
npm run dev
```

Excel 导入表头建议：

```text
姓名,手机号,微信号,学校,年级,专业,教资方向,来源渠道,意向等级,跟进状态,下次跟进时间,备注
```

## AI 学员服务系统已实现功能

- 学员管理：`/student-service`
  - 学员档案、学校、年级、专业、报名班型、教资方向、所属班级、所属教务、学习状态、服务备注
  - 教务/管理员可新增学员，招生老师只能查看自己归属的成交学员
  - 支持一键生成 AI 学习计划和 AI 学员服务话术
- 班级管理：`/student-service/classes`
  - 班级名称、所属校区、开课时间、班主任/教务、授课老师、学员人数
- 课程表：`/student-service/schedule`
  - 课程标题、班级、授课老师、上课时间、教室/链接、作业提醒内容
- 打卡记录：`/student-service/check-ins`
  - 到课、迟到、缺课、请假记录
- 缺课提醒：`/student-service/absences`
  - 汇总缺课学员，便于教务跟进
- 推送接口预留：
  - `POST /api/student-service/push`
  - 当前返回企业微信/OpenClaw 的预留 payload，后续配置密钥、接收人映射和回调后替换为真实发送

学员服务数据库变更位于迁移 `20260522172000_student_service`。如果本地已有数据库，执行：

```bash
npx prisma migrate deploy
npm run db:seed
```

## AI 题库系统已实现功能

- 题目列表：`/question-bank`
  - 支持科目、题型、来源、章节、知识点、难度、高频标签、年份、答案解析
  - 支持新增/编辑题目
  - 支持 AI 生成解析
  - 支持 `.xlsx/.xls/.csv` 批量导入
- 自动组卷：`/question-bank/papers`
  - 按科目、章节、知识点、难度范围、题量生成试卷
- 错题本：`/question-bank/wrong-questions`
  - 记录学员错题、答案、错因、是否掌握
- 知识点薄弱分析：`/question-bank/weakness`
  - 按错题记录聚合薄弱知识点，计算未掌握数、平均难度和风险分

题库数据库变更位于迁移 `20260523090000_question_bank`。如果本地已有数据库，执行：

```bash
npx prisma migrate deploy
npm run db:seed
```

题目导入表头建议：

```text
科目,章节,知识点,题型,题干,选项,正确答案,解析,难度,高频标签,来源,年份
```

可用中文值：

```text
科目：综合素质、教育知识与能力、学科知识、面试结构化、试讲、答辩
题型：单选、材料分析、作文、简答、辨析、案例分析
来源：真题、模拟题、自编题
```

## 教研内容生产系统已实现功能

- 内容库：`/content`
  - 管理课程讲义、PPT 大纲、真题解析、模拟试卷、作文模板、面试结构化模板、短视频脚本、招生朋友圈文案、招生海报文案
  - 支持草稿、待审核、已通过、已发布、已废弃状态
  - 支持 AI 生成初稿、提交审核、审核通过、发布到校区
  - 支持导出 Word/PDF
- 新建内容：`/content/new`
- 版本记录：`/content/[id]/versions`
  - 查看版本历史、审核流程、导出记录
- 校区资料中心：`/content/campus-materials`
  - 按校区查看总部已发布可用资料

教研内容数据库变更位于迁移 `20260523100000_teaching_content`。如果本地已有数据库，执行：

```bash
npx prisma migrate deploy
npm run db:seed
```

## 数据分析系统已实现功能

- 仪表盘页面：`/analytics`
  - 总部数据看板
  - 校区数据看板
  - 招生数据看板
  - 教务服务看板
  - 财务简报
  - 趋势图
- 筛选能力：
  - 按时间筛选
  - 按校区筛选
  - 按招生老师筛选
- 核心指标：
  - 新增线索数、有效咨询数、成交人数、成交金额、转化率
  - 各渠道转化率、各校区业绩、招生老师业绩
  - 学员到课率、学员打卡率、作业完成率、退费率
  - 高校分成金额、老师课时费、校区利润估算
- 数据接口：
  - `GET /api/analytics/summary`
  - `GET /api/analytics/export`
  - `GET/POST /api/analytics/daily-report`
- 导出 Excel：
  - 页面点击“导出 Excel”
- 每日经营日报：
  - 页面点击“生成每日经营日报”会生成并保存当天日报

数据分析数据库变更位于迁移 `20260523110000_analytics_reports`。如果本地已有数据库，执行：

```bash
npx prisma migrate deploy
npm run db:seed
```

当前财务口径为估算值：默认客单价 2980 元、高校分成 18%、老师课时费 220 元/2 小时、校区固定成本 32%。后续接入真实收款、退费、课时结算表后可替换估算逻辑。
