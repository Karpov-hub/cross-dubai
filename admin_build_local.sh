#!/usr/bin/env bash
rm -R ~/build
mkdir ~/build
export PATH=/home/yalex/bin/Sencha/Cmd:/home/yalex/bin:/home/yalex/bin/Sencha/Cmd:/home/yalex/.nvm/versions/node/v12.22.1/bin:/home/yalex/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin

sencha upgrade --unattended

cd ./admin

cp -R ./core ~/build/core
cp ./server.js ~/build/server.js
cp ./package.json ~/build/package.json
cp ./Dockerfile ~/build/Dockerfile
mkdir ~/build/project
cp -R ./project/conf ~/build/project/conf
mkdir ~/build/project/protected
cp ./project/config-staging.json ~/build/project/config.json
mkdir ~/build/tmp
find ./project/static/admin/crm/modules/ -regex '.*\(model\).*' -exec cp --parents {} ~/build/tmp \;
node jprepare.js ~/build/tmp client
cp -R ~/build/tmp/project/static/admin/crm/modules ~/build/project/protected
cp -R ./project/protected ~/build/project
rm -R ~/build/tmp
mkdir ~/build/project/static
mkdir ~/build/project/static/admin
cp -R ./project/static/admin/locale ~/build/project/static/admin
cp -R ./project/static/admin ~/build/project/static/tmp
mv ~/build/project/static/tmp/crm ~/build/project/static/tmp/app/crm
rm ~/build/project/static/tmp/app.js
mv ~/build/project/static/tmp/app_bld.js ~/build/project/static/tmp/app.js
node jprepare.js ~/build/project/static/tmp/app/crm/modules server
mkdir ~/build/project/static/admin/crm
cp -R ~/build/project/static/tmp/app/crm/modules ~/build/project/static/admin/crm
cd ~/build/project/static/tmp
sencha app build -pr
cd ../../../
rm -R ./project/static/tmp