#!/bin/bash
# Script to push with account selection

echo "🔐 Choose GitHub account to push with:"
echo "1) theo24-sys (current default)"
echo "2) theoekiru-byte"
read -p "Enter choice (1 or 2): " choice

case $choice in
  1)
    git config user.name "theo24-sys"
    git config user.email "timothybanjo42@gmail.com"
    echo "✓ Using: theo24-sys (timothybanjo42@gmail.com)"
    ;;
  2)
    git config user.name "theoekiru-byte"
    git config user.email "timothybanjo42@gmail.com"
    echo "✓ Using: theoekiru-byte (timothybanjo42@gmail.com)"
    ;;
  *)
    echo "❌ Invalid choice"
    exit 1
    ;;
esac

# Get branch and push
BRANCH=$(git rev-parse --abbrev-ref HEAD)
echo "📤 Pushing to $BRANCH..."
git push origin $BRANCH -v

echo "✓ Done!"
