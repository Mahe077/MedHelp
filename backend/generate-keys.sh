#!/bin/bash

# Script to generate RSA keypair for JWT signing
# Run this script from the backend directory

echo "Generating RSA keypair for JWT signing..."

# Create keys directory if it doesn't exist
mkdir -p src/main/resources/keys

# Generate private key (2048-bit RSA)
openssl genrsa -out src/main/resources/keys/private_key.pem 2048

# Extract public key from private key
openssl rsa -in src/main/resources/keys/private_key.pem -pubout -out src/main/resources/keys/public_key.pem

# Set appropriate permissions
chmod 600 src/main/resources/keys/private_key.pem
chmod 644 src/main/resources/keys/public_key.pem

echo "✅ RSA keypair generated successfully!"
echo "   Private key: src/main/resources/keys/private_key.pem"
echo "   Public key:  src/main/resources/keys/public_key.pem"
echo ""
echo "⚠️  IMPORTANT: Add keys/ directory to .gitignore!"
echo "⚠️  For production, use environment variables or secrets management."
