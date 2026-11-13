---
"safe-ts-env": patch
---

Parse the env file's JSON contents. Previously the Buffer's `toJSON()` shape was handed to the schema, so every real file failed validation.
