docker system prune -af
docker image build . -t all-services:1.0.0
docker image build . -f src/gate-service/Dockerfile -t gate-service:1.0.0
docker image build . -f admin/Dockerfile -t admin-service:1.0.0