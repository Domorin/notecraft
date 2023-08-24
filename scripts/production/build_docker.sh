# TODO: change to docker-compose.prod.yml
docker compose -f docker-compose.yml -f docker-compose.prod.yml build --progress=plain ws app
# User docker/save load to send it to prod server? https://stackoverflow.com/questions/23935141/how-to-copy-docker-images-from-one-host-to-another-without-using-a-repository