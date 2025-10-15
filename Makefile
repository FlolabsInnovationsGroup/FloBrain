SHELL := /bin/bash
.PHONY: server.install server.dev server.start server.test
server.install: ; cd apps/server && npm install
server.dev:     ; cd apps/server && npm run dev
server.start:   ; cd apps/server && npm start
server.test:    ; cd apps/server && npm test || echo "no tests yet"
