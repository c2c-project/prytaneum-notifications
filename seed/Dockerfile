FROM mongo

COPY init.json /init.json
CMD mongoimport --host mongo --db notificationService --collection notifications --type json --file /init.json --jsonArray