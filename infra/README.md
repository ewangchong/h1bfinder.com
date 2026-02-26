# H1B Friend AWS 部署 (最低成本单机方案)

这套 Terraform 配置会在 AWS 环境中创建一个最低成本的生产级单机服务器，服务器中将自动化安装 Docker 并为您准备好运行环境。

## 运行前提
1. 安装 [Terraform](https://developer.hashicorp.com/terraform/downloads) CLI (`brew install terraform`)。
2. 配置好 AWS 凭证，例如运行过 `aws configure`。
3. 如果你想通过 SSH 登录服务器，请提前在 AWS 控制台中创建一个 Key Pair 并记住名字。

## 部署步骤

1. 初始化 Terraform
```bash
terraform init
```

2. 审查即将创建的资源
```bash
terraform plan
```
如果你有建立好的 Key Pair 想要挂载给服务器，可以通过变量注入：
```bash
terraform plan -var="key_name=my-aws-key"
```

3. 确认执行
```bash
terraform apply
```

4. 部署代码
执行完毕后控制台会输出一个 `public_ip` (比如 `1.2.3.4`)。目前这台机器上已经安装好了 Docker 和 docker-compose。你可以将本仓库代码通过 SSH或Git 上传到服务器上。

例如：
```bash
ssh -i /path/to/my-aws-key.pem ec2-user@1.2.3.4
sudo su
git clone <your-repo> h1bfriend
cd h1bfriend
docker compose up -d
```

## 销毁资源
如果不想继续使用了，为了避免产生费用请一键销毁：
```bash
terraform destroy
```
