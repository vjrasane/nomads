#!/bin/bash
set -e

DOCS_DIR=${1}

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
cat << EOF > "${INDEX_FILE}"
# index
${LINKS}
EOF