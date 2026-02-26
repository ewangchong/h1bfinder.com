provider "aws" {
  region = var.aws_region
}

# --- Network Resources ---

resource "aws_vpc" "h1b_vpc" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "h1bfriend-vpc"
  }
}

resource "aws_internet_gateway" "h1b_igw" {
  vpc_id = aws_vpc.h1b_vpc.id

  tags = {
    Name = "h1bfriend-igw"
  }
}

resource "aws_subnet" "h1b_subnet" {
  vpc_id                  = aws_vpc.h1b_vpc.id
  cidr_block              = var.subnet_cidr
  map_public_ip_on_launch = true

  tags = {
    Name = "h1bfriend-subnet"
  }
}

resource "aws_route_table" "h1b_rt" {
  vpc_id = aws_vpc.h1b_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.h1b_igw.id
  }

  tags = {
    Name = "h1bfriend-rt"
  }
}

resource "aws_route_table_association" "h1b_rta" {
  subnet_id      = aws_subnet.h1b_subnet.id
  route_table_id = aws_route_table.h1b_rt.id
}

# --- Security Group ---

resource "aws_security_group" "h1b_sg" {
  name        = "h1bfriend-sg"
  description = "Allow HTTP, HTTPS, SSH, and App ports"
  vpc_id      = aws_vpc.h1b_vpc.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Allow Next.js default port if accessing directly
  ingress {
    description = "Next.js Web"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }
  
  # Allow Fastify backend port
  ingress {
    description = "Fastify API"
    from_port   = 8089
    to_port     = 8089
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "h1bfriend-sg"
  }
}

# --- EC2 Instance ---

# Get latest Amazon Linux 2023 AMI
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-x86_64"]
  }
}

resource "aws_instance" "h1b_server" {
  ami           = data.aws_ami.amazon_linux_2023.id
  instance_type = var.instance_type
  subnet_id     = aws_subnet.h1b_subnet.id
  
  vpc_security_group_ids = [aws_security_group.h1b_sg.id]
  key_name               = var.key_name != "" ? var.key_name : null

  user_data = <<-EOF
              #!/bin/bash
              sudo dnf update -y
              # Install Docker
              sudo dnf install -y docker
              sudo systemctl enable docker
              sudo systemctl start docker
              sudo usermod -aG docker ec2-user
              
              # Install Docker Compose plugin
              sudo dnf install -y docker-compose-plugin
              
              # Install git
              sudo dnf install -y git
              EOF

  tags = {
    Name = "h1bfriend-server"
  }
}

# --- Elastic IP ---

resource "aws_eip" "h1b_eip" {
  instance = aws_instance.h1b_server.id
  domain   = "vpc"

  tags = {
    Name = "h1bfriend-eip"
  }
}

# --- Outputs ---

output "public_ip" {
  value       = aws_eip.h1b_eip.public_ip
  description = "The Elastic IP address of the H1B Friend server"
}

output "ssh_command" {
  value       = "ssh -i <your-key.pem> ec2-user@${aws_eip.h1b_eip.public_ip}"
  description = "Command to SSH into the server"
}
