rm -rf dist/

# Compile for both ESM and CJS
tsc -p tsconfig.json && \
tsc -p tsconfig-cjs.json || \
  exit 1

# Tell the importer what the fuck they're importing
# cause why even use only 1 module system
cat << "EOF" > "./dist/cjs/package.json"
{
  "type": "commonjs"
}
EOF
cat << "EOF" > "./dist/mjs/package.json"
{
  "type": "module"
}
EOF
