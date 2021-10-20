# Generate private key
openssl genrsa -out private.key 4096

# Generate a Certificate Signing Request

openssl req -new -sha256 \
    -out private.csr \
    -key private.key \
    -config ssl.conf 

# Generate the certificate

openssl x509 -req \
    -days 3650 \
    -in private.csr \
    -signkey private.key \
    -out private.crt \
    -extensions req_ext \
    -extfile ssl.conf

# Add the certificate to keychain and trust it:

sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain private.crt
# https://support.kerioconnect.gfi.com/hc/en-us/articles/360015200119-Adding-Trusted-Root-Certificates-to-the-Server

# Create a pem file from crt
openssl x509 -in private.crt -out private.pem -outform PEM

# run the server
server-cmd --https --cert private.pem --key private.key
