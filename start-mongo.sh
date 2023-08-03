#!/bin/bash

# Function to check if a process is running
is_process_running() {
    pgrep $1 >/dev/null 2>&1
}

# Check if MongoDB processes are already running
if is_process_running mongod; then
    echo "MongoDB instances are already running."
else
    # Step 1: Create data directories
    mkdir -p local-db/rs1 local-db/rs2 local-db/rs3

    # Start MongoDB instances as background processes

mongod --port 27017 --dbpath local-db/rs1 --replSet pif-repl --logpath local-db/rs1.log --fork --bind_ip 127.0.0.1
mongod --port 27018 --dbpath local-db/rs2 --replSet pif-repl --logpath local-db/rs2.log --fork --bind_ip 127.0.0.1
mongod --port 27019 --dbpath local-db/rs3 --replSet pif-repl --logpath local-db/rs3.log --fork --bind_ip 127.0.0.1


    # Wait for MongoDB instances to start
    sleep 6

    # Connect to the MongoDB shell
    mongosh --port 27017 <<EOF
    // Configure replica set
    rsconf = {
      _id: "pif-repl",
      members: [
        { _id: 0, host: "localhost:27017" },
        { _id: 1, host: "localhost:27018" },
        { _id: 2, host: "localhost:27019" }
      ]
    }
    rs.initiate(rsconf)
    rs.status()
EOF
fi
