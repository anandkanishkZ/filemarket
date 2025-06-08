#!/bin/bash

# Script to start MySQL service on different systems

echo "🔍 Checking MySQL service status..."

# Function to check if MySQL is running
check_mysql() {
    if command -v mysql >/dev/null 2>&1; then
        if mysql -u root -e "SELECT 1;" >/dev/null 2>&1; then
            echo "✅ MySQL is running"
            return 0
        else
            echo "❌ MySQL is installed but not running"
            return 1
        fi
    else
        echo "❌ MySQL is not installed"
        return 2
    fi
}

# Check current status
check_mysql
mysql_status=$?

if [ $mysql_status -eq 0 ]; then
    echo "✅ MySQL is already running!"
    exit 0
elif [ $mysql_status -eq 2 ]; then
    echo "❌ MySQL is not installed on this system"
    echo "💡 Please install MySQL first:"
    echo "   - Ubuntu/Debian: sudo apt-get install mysql-server"
    echo "   - CentOS/RHEL: sudo yum install mysql-server"
    echo "   - macOS: brew install mysql"
    exit 1
fi

echo "🚀 Attempting to start MySQL..."

# Try different methods to start MySQL
if command -v systemctl >/dev/null 2>&1; then
    echo "📝 Using systemctl..."
    sudo systemctl start mysql || sudo systemctl start mysqld
elif command -v service >/dev/null 2>&1; then
    echo "📝 Using service command..."
    sudo service mysql start || sudo service mysqld start
elif command -v brew >/dev/null 2>&1; then
    echo "📝 Using brew services (macOS)..."
    brew services start mysql
else
    echo "❌ Could not determine how to start MySQL on this system"
    echo "💡 Please start MySQL manually using your system's service manager"
    exit 1
fi

# Wait a moment for MySQL to start
sleep 3

# Check if MySQL started successfully
echo "🔍 Verifying MySQL started..."
check_mysql
if [ $? -eq 0 ]; then
    echo "✅ MySQL started successfully!"
    echo "💡 You can now run: npm run dev"
else
    echo "❌ Failed to start MySQL"
    echo "💡 Please check MySQL logs and start it manually"
    exit 1
fi