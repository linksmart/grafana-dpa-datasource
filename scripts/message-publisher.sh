#!/bin/bash

# Development and demo purpose script to generate and publish data to dpa

# Config:
DPA_URL="http://localhost:8319/statement/"
MQTT_HOST="localhost"

# Insert sample statements
curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
    "name": "query1",
    "statement": "select * from SenML(bn = '\''dev1'\'')"
}' "$DPA_URL"

curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
    "name": "query2",
    "statement": "select * from SenML(bn = '\''dev2'\'')"
}' "$DPA_URL"

curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
    "name": "query3",
    "statement": "select count(*) from SenML(bn = '\''dev1'\'')"
}' "$DPA_URL"

curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
    "name": "query4",
    "statement": "select count(*) as count, bn from SenML(bn = '\''dev2'\'')"
}' "$DPA_URL"

curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
    "name": "query5",
    "statement": "select window(*) from SenML(bn = '\''dev1'\'').win:length(60)"
}' "$DPA_URL"

curl -X POST -H "Content-Type: application/json" -H "Cache-Control: no-cache" -d '{
    "name": "query6",
    "statement": "select window(*) from SenML(bn = '\''dev2'\'').win:length(60)"
}' "$DPA_URL"

# publish data
for (( ; ; ))
do
  sleep 1
  mosquitto_pub -h "$MQTT_HOST" -t /testing/generator/dev1 -m "{ \"e\":[{\"v\":$RANDOM}], \"bn\" : \"dev1\", \"bt\":\"$(date  +%s)\"}"
  mosquitto_pub -h "$MQTT_HOST" -t /testing/generator/dev1 -m "{ \"e\":[{\"v\":$RANDOM}], \"bn\" : \"dev2\", \"bt\":\"$(date  +%s)\"}"
done
