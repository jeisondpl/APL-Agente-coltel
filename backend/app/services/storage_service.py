import base64
import logging
import posixpath

import boto3
from botocore.exceptions import ClientError
from core.config import settings
from fastapi import UploadFile

from app.schemas.schemas import PictureBlock

logger = logging.getLogger(__name__)


BUCKET_NAME = settings.bucket_name
MINIO_ENDPOINT = settings.minio_endpoint
MINIO_EXTERNAL_ENDPOINT = settings.minio_external_endpoint

s3 = boto3.client(
    "s3",
    endpoint_url=settings.minio_endpoint,
    aws_access_key_id=settings.minio_access_key,
    aws_secret_access_key=settings.minio_secret_key,
    region_name="us-east-1",
)


def _bucket_exists(bucket: str) -> bool:
    """Check if a bucket exists."""
    try:
        s3.head_bucket(Bucket=bucket)
        return True
    except ClientError as e:
        if e.response["Error"]["Code"] == "404":
            return False
        logger.error(f"Error checking bucket '{bucket}': {e}")
        raise


def create_bucket_if_not_exists(bucket):
    """Create bucket if it doesn't exist. Returns True if created, False if already exists."""
    try:
        if _bucket_exists(bucket):
            logger.info(f"Bucket '{bucket}' already exists")
            return False
    except Exception as e:
        logger.error(f"Error verifying bucket '{bucket}': {e}")
        raise

    try:
        s3.create_bucket(Bucket=bucket)
        logger.info(f"Bucket '{bucket}' created successfully")
        return True
    except ClientError as e:
        logger.error(f"Failed to create bucket '{bucket}': {e}")
        raise


def upload_file(file: UploadFile, path: str = "", bucket_name: str = BUCKET_NAME):
    """Upload file to bucket in a specific path."""
    try:
        if not _bucket_exists(bucket_name):
            logger.error(f"Bucket '{bucket_name}' does not exist. Cannot upload file.")
            return False
    except Exception as e:
        logger.error(f"Error checking bucket '{bucket_name}': {e}")
        return False

    key = posixpath.join(path, file.filename)
    try:
        s3.upload_fileobj(Fileobj=file.file, Bucket=bucket_name, Key=key)
        logger.info(f"File uploaded successfully: {key}")
        return True
    except ClientError as e:
        logger.error(f"Failed to upload file '{key}' to bucket '{bucket_name}': {e}")
        return False


def upload_local_file(file_obj, filename: str, bucket_name: str = BUCKET_NAME):
    """Upload file to bucket in a specific path."""
    try:
        if not _bucket_exists(bucket_name):
            logger.error(f"Bucket '{bucket_name}' does not exist. Cannot upload file.")
            return False
    except Exception as e:
        logger.error(f"Error checking bucket '{bucket_name}': {e}")
        return False

    try:
        s3.upload_fileobj(Fileobj=file_obj, Bucket=bucket_name, Key=filename)
        logger.info(f"File uploaded successfully: {filename}")
        return True
    except ClientError as e:
        logger.error(
            f"Failed to upload file '{filename}' to bucket '{bucket_name}': {e}"
        )
        return False


def upload_folder_to_storage(
    folder_path, s3_folder: str, bucket_name: str = BUCKET_NAME
):
    """Upload folder to bucket in a specific path."""
    created = create_bucket_if_not_exists(bucket_name)
    if created:
        logger.error(f"Bucket '{bucket_name}' created: {created}")
    logger.info(f"Files sent to storage: folder {folder_path}")
    for file in folder_path.rglob("*"):
        if file.is_file():
            # Preservar la estructura de directorios relativos
            relative_path = file.relative_to(folder_path)
            s3_key = f"{s3_folder}/{relative_path}".replace("\\", "/")
            with file.open("rb") as f:
                try:
                    s3.upload_fileobj(f, bucket_name, s3_key)
                    logger.info(f"File uploaded succesfully: {s3_key}")
                except Exception as e:
                    logger.error(f"Failed to upload file {s3_key}: {e}")


def list_top_level_folders(path: str = "", bucket_name: str = BUCKET_NAME):
    """List top level folders in a path of a bucket."""
    try:
        if not _bucket_exists(bucket_name):
            logger.error(f"Bucket '{bucket_name}' does not exist. Cannot list folders.")
            return []
    except Exception as e:
        logger.error(f"Error checking bucket '{bucket_name}': {e}")
        return []

    try:
        prefix = path.rstrip("/")
        if prefix:
            prefix = f"{prefix}/"

        response = s3.list_objects_v2(
            Bucket=bucket_name,
            Prefix=prefix,
            Delimiter="/",
        )

        if "CommonPrefixes" not in response:
            logger.warning(
                f"No top level folders found in bucket '{bucket_name}' at path '{path}'"
            )
            return []

        return [cp["Prefix"].rstrip("/") for cp in response["CommonPrefixes"]]
    except ClientError as e:
        logger.error(f"Failed to list folders in bucket '{bucket_name}': {e}")
        return []


def delete_folder(path: str = "", bucket_name: str = BUCKET_NAME):
    """Drop folder from a path of a bucket."""
    try:
        if not _bucket_exists(bucket_name):
            logger.error(
                f"Bucket '{bucket_name}' does not exist. Cannot delete folder."
            )
            return False
    except Exception as e:
        logger.error(f"Error checking bucket '{bucket_name}': {e}")
        return False

    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=path)
        if "Contents" not in response:
            logger.warning(f"Bucket '{bucket_name}' or path '{path}' is empty")
            return True

        for obj in response["Contents"]:
            key = obj["Key"]
            s3.delete_object(Bucket=bucket_name, Key=key)
            logger.info(f"Deleted file: {key}")
        return True
    except ClientError as e:
        logger.error(
            f"Failed to delete folder '{path}' from bucket '{bucket_name}': {e}"
        )
        return False


def generate_download_url(
    object_name: str,
    path: str = "",
    bucket_name: str = BUCKET_NAME,
    expires_seconds=300,
):
    """Generate download url for a file in a path of a bucket."""
    try:
        if not _bucket_exists(bucket_name):
            logger.error(
                f"Bucket '{bucket_name}' does not exist. Cannot generate download URL."
            )
            return None
    except Exception as e:
        logger.error(f"Error checking bucket '{bucket_name}': {e}")
        return None

    try:
        key = posixpath.join(path, object_name)
        url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": bucket_name,
                "Key": key,
            },
            ExpiresIn=expires_seconds,
        )
        url = url.replace(settings.minio_endpoint, settings.minio_external_endpoint)
        return url
    except ClientError as e:
        logger.error(
            f"Failed to generate download URL for '{key}' in bucket '{bucket_name}': {e}"
        )
        return None


def get_object_stream(object_name: str, path: str = "", bucket_name: str = BUCKET_NAME):
    """Return an file-like object ready for streaming from a path of a bucket."""
    try:
        if not _bucket_exists(bucket_name):
            logger.error(
                f"Bucket '{bucket_name}' does not exist. Cannot get object stream."
            )
            return None
    except Exception as e:
        logger.error(f"Error checking bucket '{bucket_name}': {e}")
        return None

    key = posixpath.join(path, object_name)
    try:
        response = s3.get_object(Bucket=bucket_name, Key=key)
        return response["Body"]
    except ClientError as e:
        logger.error(
            f"Failed to get object stream for '{key}' from bucket '{bucket_name}': {e}"
        )
        return None


def get_images_as_base64(path: str, bucket_name: str = BUCKET_NAME):
    """Return a list of images as base64 strings from a path of a bucket."""
    image_blocks = []
    try:
        if not _bucket_exists(bucket_name):
            logger.error(
                f"Bucket '{bucket_name}' does not exist. Cannot retrieve images."
            )
            return []
    except Exception as e:
        logger.error(f"Error checking bucket '{bucket_name}': {e}")
        return []

    try:
        response = s3.list_objects_v2(Bucket=bucket_name, Prefix=path)
        if "Contents" not in response:
            logger.warning(
                f"No contents found in bucket '{bucket_name}' at path '{path}'"
            )
            return []
        for obj in response["Contents"]:
            file_path = obj["Key"]
            if file_path.lower().endswith((".png", ".jpg", ".jpeg")):
                img_obj = s3.get_object(Bucket=bucket_name, Key=file_path)
                content = img_obj["Body"].read()
                base64_str = base64.b64encode(content).decode("utf-8")
                extension = file_path.split(".")[-1]
                image_blocks.append(
                    PictureBlock(
                        type="picture",
                        data=base64_str,
                        format=extension,
                        name=file_path,
                    )
                )
    except ClientError as e:
        logger.error(f"Error retrieving images from bucket '{bucket_name}': {e}")
    return image_blocks
