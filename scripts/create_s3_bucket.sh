#!/bin/bash
#===================================================================================
# create_s3_bucket.sh - Script to create MinIO S3 buckets with proper permissions
#===================================================================================

# Exit on error and pipe failures
set -eo pipefail

#===================================================================================
# VARIABLES AND CONSTANTS
#===================================================================================
MINIO_CLIENT_DIR="$HOME/minio-client"
MC_BIN="$MINIO_CLIENT_DIR/mc"
# Default to local MinIO endpoint if not specified
DEFAULT_MINIO_ENDPOINT="http://localhost:9000"

#===================================================================================
# UTILITY FUNCTIONS
#===================================================================================
log_info() {
    echo "🔄 $1"
}

log_success() {
    echo "✅ $1"
}

log_warning() {
    echo "⚠️ $1"
}

log_error() {
    echo "❌ $1"
    exit 1
}

#===================================================================================
# VALIDATION FUNCTIONS
#===================================================================================
check_arguments() {
    if [ "$#" -lt 6 ]; then
        log_error "Missing required parameters
Usage: $0 <bucket_name> <access_key> <secret_key> <bucket_policy> <root_user> <root_password> [minio_endpoint]"
    fi

    # Validate bucket policy
    case "$4" in
    "private" | "public" | "download" | "upload") ;;
    *) log_error "Invalid bucket policy: $4. Must be one of: private, public, download, upload" ;;
    esac
}

#===================================================================================
# MINIO CLIENT SETUP
#===================================================================================
setup_minio_client() {
    # Check if mc command is available in PATH
    if command -v mc >/dev/null 2>&1; then
        log_success "MinIO client (mc) is already installed in system PATH"
        MC_BIN="mc"
    else
        # Create minio-client directory if it doesn't exist
        mkdir -p "$MINIO_CLIENT_DIR"
        cd "$MINIO_CLIENT_DIR" || log_error "Failed to create/access MinIO client directory"

        # Check if mc is already installed and executable in the MINIO_CLIENT_DIR
        if [ -f "$MC_BIN" ] && [ -x "$MC_BIN" ]; then
            log_success "MinIO client is already installed in $MINIO_CLIENT_DIR"
        else
            log_info "Installing MinIO client..."

            # Detect system type
            OS_TYPE=$(uname -s)
            ARCH=$(uname -m)

            case "$OS_TYPE" in
            Darwin)
                # For macOS
                case "$ARCH" in
                x86_64)
                    MC_URL="https://dl.min.io/client/mc/release/darwin-amd64/mc"
                    ;;
                arm64)
                    MC_URL="https://dl.min.io/client/mc/release/darwin-arm64/mc"
                    ;;
                *)
                    log_error "Unsupported architecture: $ARCH"
                    ;;
                esac
                ;;
            Linux)
                # For Linux
                case "$ARCH" in
                x86_64)
                    MC_URL="https://dl.min.io/client/mc/release/linux-amd64/mc"
                    ;;
                aarch64 | arm64)
                    MC_URL="https://dl.min.io/client/mc/release/linux-arm64/mc"
                    ;;
                *)
                    log_error "Unsupported architecture: $ARCH"
                    ;;
                esac
                ;;
            MINGW*|MSYS*|CYGWIN*)
                # For Windows (Git Bash or similar)
                MC_URL="https://dl.min.io/client/mc/release/windows-amd64/mc.exe"
                MC_BIN="$MINIO_CLIENT_DIR/mc.exe"
                ;;
            *)
                log_error "Unsupported operating system: $OS_TYPE"
                ;;
            esac

            # Download MinIO client using curl
            log_info "Downloading from $MC_URL"
            curl -s --location "$MC_URL" -o "$MC_BIN" ||
                log_error "Failed to download MinIO client"

            # Make it executable (not needed for Windows, but harmless)
            chmod +x "$MC_BIN" || log_error "Failed to make MinIO client executable"
            log_success "MinIO client installed successfully"
        fi
    fi

    # Configure the MinIO client
    log_info "Configuring MinIO client..."
    "$MC_BIN" alias set myminio "$MINIO_ENDPOINT" "$MINIO_USER" "$MINIO_PASSWORD" ||
        log_error "Failed to configure MinIO client"
    log_success "MinIO client configured"
}

#===================================================================================
# BUCKET MANAGEMENT FUNCTIONS
#===================================================================================
create_bucket_if_not_exists() {
    # Check if bucket already exists
    if "$MC_BIN" ls myminio/$BUCKET_NAME >/dev/null 2>&1; then
        log_warning "Bucket $BUCKET_NAME already exists"
    else
        # Create bucket
        "$MC_BIN" mb myminio/$BUCKET_NAME || log_error "Failed to create bucket $BUCKET_NAME"
        log_success "Bucket $BUCKET_NAME created successfully"
    fi
}

create_user_if_not_exists() {
    # Create a user for this bucket if it doesn't exist
    if ! "$MC_BIN" admin user info myminio "$ACCESS_KEY" >/dev/null 2>&1; then
        log_info "Creating user $ACCESS_KEY"
        "$MC_BIN" admin user add myminio "$ACCESS_KEY" "$SECRET_KEY" ||
            log_error "Failed to create user $ACCESS_KEY"
        log_success "User $ACCESS_KEY created successfully"
    else
        log_warning "User $ACCESS_KEY already exists"
    fi
}

#===================================================================================
# POLICY MANAGEMENT FUNCTIONS
#===================================================================================
apply_bucket_anonymous_policy() {
    # Apply the bucket access policy using anonymous command
    log_info "Applying bucket anonymous policy..."

    case "$BUCKET_POLICY" in
    "private")
        # For private, remove all anonymous access
        "$MC_BIN" anonymous set none myminio/$BUCKET_NAME ||
            log_error "Failed to set private policy for $BUCKET_NAME"
        ;;
    "public")
        # For public, allow full read/write anonymous access
        "$MC_BIN" anonymous set public myminio/$BUCKET_NAME ||
            log_error "Failed to set public policy for $BUCKET_NAME"
        ;;
    "download")
        # For download, allow read-only anonymous access
        "$MC_BIN" anonymous set download myminio/$BUCKET_NAME ||
            log_error "Failed to set download policy for $BUCKET_NAME"
        ;;
    "upload")
        # For upload, allow write-only anonymous access
        "$MC_BIN" anonymous set upload myminio/$BUCKET_NAME ||
            log_error "Failed to set upload policy for $BUCKET_NAME"
        ;;
    esac

    log_success "Bucket anonymous policy applied successfully"
}

create_user_policy() {
    local user_policy_file
    user_policy_file=$(mktemp)

    cat >"$user_policy_file" <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:*"],
            "Resource": [
                "arn:aws:s3:::$BUCKET_NAME/*",
                "arn:aws:s3:::$BUCKET_NAME"
            ]
        }
    ]
}
EOF

    # Create and attach user policy
    "$MC_BIN" admin policy create myminio "${BUCKET_NAME}-policy" "$user_policy_file" ||
        {
            log_error "Failed to create policy for bucket $BUCKET_NAME"
            rm "$user_policy_file"
        }

    "$MC_BIN" admin policy attach myminio "${BUCKET_NAME}-policy" --user "$ACCESS_KEY" ||
        {
            log_error "Failed to attach policy to user $ACCESS_KEY"
            rm "$user_policy_file"
        }

    rm "$user_policy_file"
}

#===================================================================================
# VERIFICATION FUNCTIONS
#===================================================================================
verify_bucket() {
    log_info "Verifying bucket accessibility..."
    "$MC_BIN" ls myminio/$BUCKET_NAME >/dev/null 2>&1 ||
        log_error "Failed to verify bucket $BUCKET_NAME creation"

    # Test listing functionality explicitly
    log_info "Testing bucket listing functionality..."
    "$MC_BIN" ls myminio/$BUCKET_NAME ||
        log_error "Failed to list bucket contents"
}

#===================================================================================
# MAIN EXECUTION
#===================================================================================
main() {
    # Check arguments
    check_arguments "$@"

    # Assign arguments to variables
    BUCKET_NAME=$1
    ACCESS_KEY=$2
    SECRET_KEY=$3
    BUCKET_POLICY=$4
    MINIO_USER=$5
    MINIO_PASSWORD=$6

    # Set MinIO endpoint with priority:
    # 1. Use 7th argument if provided
    # 2. Use environment variable if set
    # 3. Otherwise use default local endpoint
    MINIO_ENDPOINT=${7:-${MINIO_ENDPOINT:-$DEFAULT_MINIO_ENDPOINT}}

    # Display initial information
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "                      MINIO S3 BUCKET CREATION TOOL                           "
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log_info "Bucket Name: $BUCKET_NAME"
    log_info "Policy: $BUCKET_POLICY"
    log_info "Endpoint: $MINIO_ENDPOINT"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Execute the_setup_minio_client
    create_bucket_if_not_exists
    create_user_if_not_exists
    apply_bucket_anonymous_policy
    create_user_policy
    verify_bucket

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 MinIO S3 bucket $BUCKET_NAME created and configured successfully!"
    echo "To use your bucket locally, use the following credentials:"
    echo "   Endpoint: $MINIO_ENDPOINT"
    echo "   Bucket Name: $BUCKET_NAME"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    return 0
}

# Call main function with all arguments
main "$@"