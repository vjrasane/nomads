#!/bin/bash

INPUT_FILE="${1}"
OUTPUT_FILE="${2}"
shift 2;

DOCS="$(./node_modules/jsdoc-to-markdown/bin/cli.js \
  --name-format \
  --separators \
  --module-index-format grouped \
  ${INPUT_FILE})"

[[ -z "$DOCS" ]] && exit 0;
echo "${DOCS}" > "${OUTPUT_FILE}";
