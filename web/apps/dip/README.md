# DIP 数字员工

## 安装依赖

```bash
pnpm install
```

## 启动

```bash
pnpm run dev
```

默认访问地址：[http://localhost:3001](http://localhost:3001)

## 调试

### 修改配置

复制 `.env.example` → `.env.local`，修改配置

```bash
DEBUG_ORIGIN=https://your-backend-origin # DIP Studio 服务的访问地址（本地通常是 http://127.0.0.1:3000）
PUBLIC_TOKEN=your_access_token # 可以为空
PUBLIC_REFRESH_TOKEN=your_refresh_token # 可以为空
```

### 跳过认证

在 `.env.local` 中新增配置：

`PUBLIC_SKIP_AUTH=true`

### 切换 admin / 普通用户

在 `.env.local` 中新增配置：

`PUBLIC_IS_ADMIN=true`

## 开发质量检查

建议在提交代码前执行：

```bash
pnpm run gate:local
```

`gate:local` 当前包含：

- `pnpm run lint`
- `pnpm run typecheck`

如需一键格式化并修复样式问题，可执行：

```bash
pnpm run check:all
```

## 生产构建

构建：

```bash
pnpm run build
```

本地预览生产版本：

```bash
pnpm run preview
```

## 常见问题

### 1) 端口被占用

默认开发端口是 `3001`。若启动失败，请先释放端口或调整本地运行环境后重试。

### 2) 接口请求失败或代理不生效

请检查 `.env.local` 中 `DEBUG_ORIGIN` 是否配置正确，并确认目标服务可访问。

### 3) 登录状态异常

如本地调试需要，可在 `.env.local` 中启用：

- `PUBLIC_SKIP_AUTH=true`（跳过认证）
- `PUBLIC_IS_ADMIN=true`（管理员视角）
