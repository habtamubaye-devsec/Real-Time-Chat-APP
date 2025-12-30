# Optional: replace local disk storage

This project’s default implementation stores decoded Base64 uploads to local disk (the `uploads/` folder) and serves them via `GET /uploads/<filename>`.

If you want to store files in **Supabase Storage** or **S3** instead, keep the GraphQL API the same (`filename` + `base64`) and replace the part that currently does `fs.writeFile(...)`.

## Supabase Storage (concept)

1) Install:

- `npm i @supabase/supabase-js`

2) Env vars:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET`
- `PUBLIC_BASE_URL` (optional, for your API base URL)

3) Upload flow (example):

```ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

const path = `${Date.now()}-${originalFilename}`;
await supabase.storage.from(process.env.SUPABASE_BUCKET!).upload(path, buffer, {
  contentType: detectedContentType ?? 'application/octet-stream',
  upsert: false,
});

const { data } = supabase.storage.from(process.env.SUPABASE_BUCKET!).getPublicUrl(path);
return { filename: path, url: data.publicUrl };
```

## AWS S3 (concept)

1) Install:

- `npm i @aws-sdk/client-s3`

2) Env vars:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `S3_BUCKET`

3) Upload flow (example):

```ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({ region: process.env.AWS_REGION! });

const key = `${Date.now()}-${originalFilename}`;
await s3.send(
  new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!,
    Key: key,
    Body: buffer,
    ContentType: detectedContentType ?? 'application/octet-stream',
  }),
);

return {
  filename: key,
  url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodeURIComponent(key)}`,
};
```
