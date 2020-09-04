# Proposals

Future Notification Service change proposals.

## Expanding invite to store list to allow for bot list

- Method 1: Store the list in the database, and update the list upon a new upload (invite list should be treated as a set in order to ensure each email is singleton).

- Method 2: Store the list locally and replace with the most up-to-date version when a new version is uploaded. (Can be done with Multer Storage)

## Multer Info

- Multer stores the data `req.file.buffer` in memory by default. In order to handle larger files without the risk of running out of memory, we can either set a limit for the uplaoded file size, or we can store the file locally and read it in chunks, parsing the csv data chunks with middleware, and handling those set chunk sizes, thus preventing us from running out of memory.

- Note: Ensure that the files are removed after being used. Using a read file stream we can allow for larger file sizes.
