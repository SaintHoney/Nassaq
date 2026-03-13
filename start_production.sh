#!/bin/bash
mkdir -p /home/runner/data/mongodb

# Start MongoDB if not already running
if ! pgrep -x mongod > /dev/null; then
    mongod --dbpath /home/runner/data/mongodb --logpath /tmp/mongod.log --bind_ip 127.0.0.1 &
    sleep 3
fi

cd backend && uvicorn server:app --host 0.0.0.0 --port 5000
