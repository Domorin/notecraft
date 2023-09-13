# create the migration in docker so env variables are all consistent (if it was outside of docker we'd need to use localhost)
docker exec -it notecraft-app bash -c "npx prisma migrate deploy"