#!/bin/bash
# load_files.sh - 逐文件加载 LCA 数据到 Postgres

# 请根据您的实际路径修改
DATA_DIR="/Users/chongwang/Documents/openclaw-workspace/h1b-data"
DONE_DIR="$DATA_DIR/done"
export DATABASE_URL="${DATABASE_URL:-postgres://h1b:change_me@localhost:5432/h1bfriend}"

# 切换到脚本所在目录(etl)
cd "$(dirname "$0")" || exit
source venv/bin/activate

# 创建已完成文件夹，防止崩溃后重新跑旧文件
mkdir -p "$DONE_DIR"

echo "=========================================================="
echo "    启动逐文件加载流程 (防止 OOM / 支持断点续传)"
echo "=========================================================="

# 1. 删除索引以加快 COPY 写入速度
echo "▶ 步骤 1: 准备阶段 (删除 lca_raw 上的索引)"
python3 main.py --prepare

echo ""
echo "▶ 步骤 2: 循环处理每一个未加载的 Excel 文件"
for file in $(ls -1 "$DATA_DIR"/*.xlsx 2>/dev/null | sort); do
    filename=$(basename "$file")
    
    # 从文件名提取财年（如 2024）
    if [[ "$filename" =~ (20[0-9]{2}) ]]; then
        year="${BASH_REMATCH[1]}"
        echo "----------------------------------------------------------"
        echo "正在加载: $filename (财年: $year)"
        echo "----------------------------------------------------------"
        
        # 加载单个文件，跳过索引和缓存重建（加速单步加载）
        python3 main.py --file "$file" --year "$year" --skip-indexes --skip-caches
        
        if [ $? -eq 0 ]; then
            echo "✅ 成功! $filename 移动到 done/ 目录以防止重复加载"
            mv "$file" "$DONE_DIR/"
        else
            echo "❌ 加载失败中止! 文件名: $filename"
            echo "提示: 修复问题后(如 OOM或格式错误) 直接重新运行本脚本即可断点续传。"
            exit 1
        fi
    fi
done

echo ""
echo "=========================================================="
echo "所有数据文件已加载完毕！"
echo "▶ 步骤 3: 收尾阶段 (重建索引 / 生成汇总表缓存)"
echo "=========================================================="
python3 main.py --finalize

echo "🎉 全部 ETL 流程执行完毕！"
