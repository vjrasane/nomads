#!/bin/bash
set -e
DOCS_DIR="${1}"

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd);

INDEX_TEMPLATE="${SCRIPT_DIR}/index.template"
INDEX_FILE="${DOCS_DIR}/index.md"

rm -f "${INDEX_FILE}"

LINKS=""
DOCS=$(ls ${DOCS_DIR}/*.md)
for DOC in ${DOCS}; do
	NAME=$(basename "${DOC}" .md);
	URI=./$(basename "${DOC}")
	LINK="* [${NAME}](${URI})";
	LINKS="${LINKS}
${LINK}";
done

export INDEX_LINKS=${LINKS}
cat "${INDEX_TEMPLATE}" | envsubst > "${INDEX_FILE}"