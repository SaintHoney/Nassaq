#!/bin/bash
cd frontend
REACT_APP_BACKEND_URL='' NODE_OPTIONS='--max-old-space-size=1536' yarn build
