import os
from google.cloud import storage

# Point to your credentials file
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "gcp-key.json"

bucket_name = "your-bucket-name"           # TODO: Change to your bucket name
source_file = "output.wav"                 
destination_blob = "audio/output.wav"      

storage_client = storage.Client()
bucket = storage_client.bucket(bucket_name)
blob = bucket.blob(destination_blob)

blob.upload_from_filename(source_file)
print(f"File {source_file} uploaded to gs://{bucket_name}/{destination_blob}")