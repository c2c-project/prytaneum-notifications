FROM mongo

COPY init.json /init.json
CMD mongoimport --host mongo --db Notification-Service --collection Notifications --type json --file /init.json --jsonArray