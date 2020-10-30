# CI/CD PIPELINE

## Precommit

- When commiting, husky runs the command `pretty-quick --staged` which ensures that all the files are formatted according to the `.prettierrc` file. If a file is not formatted correctly it will not allow the commit and print out where the problems are. If all the files are formatted correctly the commit goes as normal with Husky outputting any files it was able to fix along with the message `Everything is awesome!`.

## Push

- Once pushing to the repo, two github actions will fire off.

- 1. Eslint: A linting action will check that there are no linter errors/warnings with a tolerance of 0 warnings (as specified in the command within `package.json`'s `eslint:github-action` script).

- 2. docker-test: An action that builds the application image as specified in the `Dockerfile` where the env variables are provided via github repo keys. The `docker-compose-test` file is then run. The exit status (determined by the tests passing/failing) then resolves the action as either pass or fail.

## Docker Hub (optional)

- Pushing the image to dockerhub can be accomplished in two ways.

- 1. By creating the repo in dockerhub and linking the github repository through it so it automatially detects when a new build is pushed.

- 2. Adding onto the docker github action we could simply push the image using the docker push commands.

- NOTE: With either method, it is important to set the build env variables in the automated build configuration (on build tab in dockerhub). The sut service in the `docker-compose-test` file is what allows for automated tests in the dockerhub repo. With automated tests the build will fail if the tests don't pass.
