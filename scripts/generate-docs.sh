#!/bin/bash
set -e

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd);
PROJECT_DIR="${SCRIPT_DIR}/.."
DOCS_DIR="${PROJECT_DIR}/docs"
TS_TMP_OUTPUT_DIR="${PROJECT_DIR}/.tmp-ts-output"

rm -rf "${TS_TMP_OUTPUT_DIR}"
./node_modules/.bin/tsc \
  --project tsconfig.json \
  --outDir ${TS_TMP_OUTPUT_DIR}

mkdir -p "${DOCS_DIR}"

FILES=$(ls ${TS_TMP_OUTPUT_DIR}/*.js)
for FILE in $FILES; do
  INPUT_FILENAME=$(basename "${FILE}")
  OUTPUT_FILE="${DOCS_DIR}/${INPUT_FILENAME%.*}.md"
	${SCRIPT_DIR}/generate-module-doc.sh "${FILE}" "${OUTPUT_FILE}"
done

${SCRIPT_DIR}/generate-index.sh "${DOCS_DIR}"

rm -rf "${TS_TMP_OUTPUT_DIR}"