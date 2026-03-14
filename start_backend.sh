#!/bin/bash

# Load MONGO_URL from backend/.env if not already set
if [ -z "$MONGO_URL" ]; then
    export $(grep -v '^#' backend/.env | xargs)
fi

# Only start local MongoDB if MONGO_URL points to localhost (not Atlas/cloud)
if echo "$MONGO_URL" | grep -q "mongodb+srv://\|mongodb://.*\.mongodb\.net"; then
    echo "Using cloud MongoDB (Atlas). Skipping local MongoDB startup."
else
    mkdir -p /home/runner/data/mongodb
    if ! pgrep -x mongod > /dev/null; then
        mongod --dbpath /home/runner/data/mongodb --logpath /tmp/mongod.log --bind_ip 127.0.0.1 &
        echo "Waiting for local MongoDB to start..."
        for i in $(seq 1 30); do
            if python3 -c "import socket; s=socket.socket(); s.settimeout(1); s.connect(('127.0.0.1',27017)); s.close()" 2>/dev/null; then
                echo "Local MongoDB is ready!"
                break
            fi
            sleep 1
        done
    fi
fi

cd backend && uvicorn server:app --host 0.0.0.0 --port 8001 --reload
