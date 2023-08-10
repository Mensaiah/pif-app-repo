#!/bin/bash

# Function to check if a process is running on a specific port
is_process_running_on_port() {
    lsof -i :$1 | grep LISTEN >/dev/null 2>&1
}

# Check if MongoDB processes are already running
if is_process_running_on_port 27017 && ! is_process_running_on_port 27018 && ! is_process_running_on_port 27019; then
    echo "Only MongoDB instance on port 27017 is running. Killing it."
    # Kill the MongoDB process running on port 27017
    pkill -f "mongod --port 27017"
    sleep 2 # Wait for a couple of seconds to ensure the process is killed
fi

# Start the MongoDB instances if they aren't running
if ! is_process_running_on_port 27017 || ! is_process_running_on_port 27018 || ! is_process_running_on_port 27019; then
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
else
    echo "MongoDB instances are already running."
fi
