# TODO: change to docker-compose.prod.yml
echo "Building docker images"
docker compose -f docker-compose.yml -f docker-compose.build.yml --progress=plain build ws app
echo "Removing tmp"
rm -rf tmp
echo "Creating tmp"
mkdir -p tmp/images
echo "Saving images..."
# User docker/save load to send it to prod server? https://stackoverflow.com/questions/23935141/how-to-copy-docker-images-from-one-host-to-another-without-using-a-repository
docker save notecraft-ws notecraft-app -o tmp/images.tar
echo "Done saving images"
echo "Sending images to production server"
rsync -v -r -P package.json docker-compose.yml docker-compose.prod.yml .env tmp note-smith-production:/home/domorin/notecraft_test/
echo "Done sending images to production server"
ssh note-smith-production "cd /home/domorin/notecraft_test && docker load -i tmp/images.tar && npm run prodResourcesUp"
