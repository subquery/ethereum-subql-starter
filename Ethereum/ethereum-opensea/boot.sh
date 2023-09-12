rm -rf .data/
rm -rf dist/
yarn
yarn codegen
yarn build
docker-compose up && docker-compose run