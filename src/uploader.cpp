#include "uploader.h"
#include "backoff.h"
#include "config.h"
#include "storage.h"
#include <HTTPClient.h>
#include <WiFi.h>
#include <FS.h>
#include <SPIFFS.h>
#include <SD.h>

class ConcatStream : public Stream {
public:
  ConcatStream(const String& pre, File file, const String& post)
    : _pre(pre), _post(post), _file(file) {}

  int available() override {
    if (_prePos < (int)_pre.length()) return (int)_pre.length() - _prePos;
    if (_file && _file.available())   return _file.available();
    if (_postPos < (int)_post.length()) return (int)_post.length() - _postPos;
    return 0;
  }
  int read() override {
    uint8_t b;
    if (readBytes(&b, 1) == 1) return b;
    return -1;
  }
  int peek() override { return -1; }
  size_t readBytes(uint8_t *buffer, size_t length) override {
    size_t total = 0;
    // serve pre
    while (length && _prePos < (int)_pre.length()) {
      buffer[total++] = _pre[_prePos++];
      length--;
    }
    // serve file
    if (length && _file) {
      int n = _file.read(buffer + total, length);
      if (n > 0) { total += n; length -= n; }
    }
    // serve post
    while (length && _postPos < (int)_post.length()) {
      buffer[total++] = _post[_postPos++];
      length--;
    }
    return total;
  }

  // not used for upload body:
  size_t write(uint8_t) override { return 0; }
  void flush() override {}

  size_t contentLength() const {
    size_t fileLen = _file ? _file.size() : 0;
    return _pre.length() + fileLen + _post.length();
  }

private:
  String _pre, _post;
  File   _file;
  int    _prePos = 0, _postPos = 0;
};

static bool openAny(const char* path, File& f){
  if (strncmp(path, "/sd/", 4) == 0) { f = SD.open(path + 3, FILE_READ); if (f) return true; } // strip leading /sd
  f = SPIFFS.open(path, FILE_READ);
  return (bool)f;
}

bool post_file_multipart(const char* url,
                         const char* file_path,
                         const String& meta_json,
                         int& http_code)
{
  http_code = 0;

  File f;
  if (!openAny(file_path, f)) {
    Serial.printf("post_file: cannot open %s\n", file_path);
    return false;
  }

  String boundary = "----caipoBoundary7d3f2";
  String contentType = "multipart/form-data; boundary=" + boundary;

  String pre =
    "--" + boundary + "\r\n"
    "Content-Disposition: form-data; name=\"meta\"; filename=\"meta.json\"\r\n"
    "Content-Type: application/json\r\n\r\n" +
    meta_json + "\r\n" +
    "--" + boundary + "\r\n"
    "Content-Disposition: form-data; name=\"file\"; filename=\"payload.bin\"\r\n"
    "Content-Type: application/octet-stream\r\n\r\n";

  String post = "\r\n--" + boundary + "--\r\n";

  ConcatStream body(pre, f, post);
  size_t contentLen = body.contentLength();

  WiFiClient client;
  HTTPClient http;
  if (!http.begin(client, url)) { f.close(); return false; }
  http.addHeader("Content-Type", contentType);
  int code = http.sendRequest("POST", &body, contentLen);
  http.end();
  f.close();

  http_code = code;
  return code >= 200 && code < 300;
}

static bool isRetryable(int code){ return (code==0) || (code>=500); }

void run_queue_worker(const char* url, uint8_t max_tries, Telemetry& T){
  if (!SD.begin()) return; // no SD → nothing to upload

  File dir = SD.open(SD_QUEUE_DIR);
  if (!dir) return;

  File entry = dir.openNextFile();
  while (entry) {
    if (!entry.isDirectory()) {
      String name = entry.name();
      // skip meta.json files; we read meta from sidecar if present
      if (!name.endsWith(".json")) {
        String path = String("/sd") + SD_QUEUE_DIR + "/" + name;  // our openAny strips /sd
        // read sidecar meta if exists
        String metaPath = String(SD_QUEUE_DIR) + "/" + name + ".meta.json";
        String meta = "{}";
        if (SD.exists(metaPath)) {
          File m = SD.open(metaPath, FILE_READ);
          if (m) { meta = m.readString(); m.close(); }
        }

        uint8_t attempt = 0;
        bool done = false;
        while (!done && attempt < max_tries) {
          ++T.up_attempts;
          int code = 0;
          bool ok = post_file_multipart(BACKEND_URL, path.c_str(), meta, code);
          if (ok) {
            ++T.up_success;
            SD.remove(String(SD_QUEUE_DIR) + "/" + name);
            if (SD.exists(metaPath)) SD.remove(metaPath);
            done = true;
          } else if (isRetryable(code)) {
            ++T.up_retry;
            uint32_t waitms = backoff_ms(attempt++);
            delay(waitms);
          } else {
            ++T.up_fail;
            String failedPath = String(SD_FAILED_DIR) + "/" + name;
            SD.rename(String(SD_QUEUE_DIR) + "/" + name, failedPath);
            done = true;
          }
        }
      }
    }
    entry = dir.openNextFile();
  }
  dir.close();
}