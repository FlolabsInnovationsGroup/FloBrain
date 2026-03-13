# Brain Chat – Task Split & Handoff

## What’s done (your half)

### Frontend
- **Create Brain Chat page** — Done (by Birzhan): `/brain` page with sidebar, chat area, message input.
- **Integrate chat API from backend** — Done: when the user is authenticated, the Brain page uses the backend for:
  - Listing chats: `GET /api/brain/chats/`
  - Creating a chat: `POST /api/brain/chats/`
  - Loading one chat: `GET /api/brain/chats/<id>/`
  - Updating chat title: `PATCH /api/brain/chats/<id>/` (body: `{ title }`)
  - Deleting a chat: `DELETE /api/brain/chats/<id>/`
  - Sending a message (and getting mocked AI reply): `POST /api/brain/chats/<id>/send/` (body: `{ text, image? }`)

### Backend
- **API: user text prompt → mocked AI response** — Done: `POST /api/brain/chats/<id>/send/` accepts `text` (and optional `image`) and returns the full chat with a placeholder assistant message appended.
- **API: delete chat by id** — Done: `DELETE /api/brain/chats/<id>/`.
- **API: rename chat (name + chat id)** — Done: `PATCH /api/brain/chats/<id>/` with `{ title }`.

---

## What remains for your teammate

### Backend (to implement)
1. **API: list user’s active chats with folders**  
   Return a list of the user’s chats **conglomerated in folders** when the user has set that up (e.g. endpoint returning chats + folders, or chats with `folder_id` and a separate folders list).
2. **API: add chat to a folder**  
   Receives **chat id** and **folder id** and adds that chat to the given folder (or removes from folder if needed).
3. **API: create folder**  
   Receives a **folder name** and creates a new folder for the user.

### Frontend (to integrate after backend is ready)
- Call the new “list with folders” endpoint on load (and optionally for create folder / add-to-folder) so that folders and chat–folder links persist when the user is authenticated.
- Optionally: wire “create folder” and “move chat to folder” in the UI to the new backend APIs (currently folders are local-only in state).

### Notes for implementation
- Backend is Django + DRF; app is `flobrain-core/backend/brain/` (models, views, serializers, urls).
- Frontend API client is in `flobrain-website/src/lib/api.ts`; Brain page is `flobrain-website/src/app/(app)/brain/page.tsx`.
- Types for folders/chats exist in `flobrain-website/src/types/chat.ts` (`Folder`, `ChatHistory.folderId`). Backend will need a `Folder` model (and likely `Chat.folder_id` or similar) plus the three endpoints above.
