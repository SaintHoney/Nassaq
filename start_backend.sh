#!/bin/bash
mkdir -p /home/runner/data/mongodb

# Start MongoDB if not already running
if ! pgrep -x mongod > /dev/null; then
    mongod --dbpath /home/runner/data/mongodb --logpath /tmp/mongod.log --bind_ip 127.0.0.1 &
    # Wait for MongoDB to be ready by checking the port
    echo "Waiting for MongoDB to start..."
    for i in $(seq 1 30); do
        if python3 -c "import socket; s=socket.socket(); s.settimeout(1); s.connect(('127.0.0.1',27017)); s.close()" 2>/dev/null; then
            echo "MongoDB is ready!"
            break
        fi
        sleep 1
    done
fi

cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload
