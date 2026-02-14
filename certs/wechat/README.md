# 微信支付 API 证书

请将微信商户平台下载的 API 证书解压后，把以下两个文件放到**本目录**（与本 README 同级）：

- `apiclient_cert.pem` — 商户证书
- `apiclient_key.pem` — 商户私钥

**获取路径**：微信支付商户平台 → 账户中心 → API 安全 → 申请 API 证书 → 下载并解压。

勿将上述 `.pem` 文件提交到 Git（已通过 .gitignore 忽略）。
