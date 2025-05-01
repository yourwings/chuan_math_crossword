#!/bin/bash

# 小川数字迷宫打包脚本
# 此脚本用于将游戏文件打包成ZIP文件，方便分发给用户

echo "开始打包小川数字迷宫游戏..."

# 创建临时目录
TEMP_DIR="./小川数字迷宫"
mkdir -p "$TEMP_DIR"

# 复制所有必要文件到临时目录
cp -r index.html "$TEMP_DIR"/
cp -r sw.js "$TEMP_DIR"/
cp -r manifest.json "$TEMP_DIR"/
cp -r README.md "$TEMP_DIR"/
cp -r distribution_guide.md "$TEMP_DIR"/
cp -r arithmetic_grid "$TEMP_DIR"/
cp -r sudoku "$TEMP_DIR"/
cp -r mental_arithmetic "$TEMP_DIR"/

# 创建ZIP文件
zip -r "小川数字迷宫.zip" "$TEMP_DIR"

# 清理临时目录
rm -rf "$TEMP_DIR"

echo "打包完成！文件已保存为 小川数字迷宫.zip"
echo "用户可以直接解压此文件，双击index.html即可开始游戏。"