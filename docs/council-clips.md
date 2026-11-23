# Council recordings: archive and clips

Editor's standing rule, 2026-11-23. The Town's council videos are public
information, and the Observer does not depend on the Town's link staying up.
Four 2026 sittings stopped answering YouTube's public lookup on 2026-11-23;
the passages cited from them survived only because clips had been cut the day
before.

## After each sitting

1. **Save the full video.** On Jesse's Mac, download the Town's video (YouTube,
   or Facebook for special sittings) into the Drive-synced folder
   `ORMSTOWN OBSERVER / YouTube Council Meeting Videos / <YYYY-MM-DD> <type>/`,
   with its `info.json`. Record the source URL, the download date and the
   file's SHA-256 in a `README.txt` beside it. Download on the Mac, into the
   synced folder; do not push gigabytes through a tool call.
2. **Transcribe** as usual (council video transcriber skill).

## When a story cites a passage

1. **Cut the clip** from the saved video: 15 to 20 seconds of padding each
   side, 720p master, named `<ID>_<YYYY-MM-DD>_<slug>_<in>-<out>.mp4`, kept in
   `YouTube Council Meeting Videos / clips <date>/`.
2. **Listen before quoting.** Transcripts are machine-made. No words go in
   quotation marks, and no speaker is named, until someone has heard the clip.
3. **Make the web copy:** 360p H.264, mono AAC, `+faststart`, plus a poster
   frame. About 1 MB per minute.

   ```bash
   ffmpeg -i in.mp4 -vf "scale=-2:360" -c:v libx264 -preset slow -crf 31 -r 24 \
     -c:a aac -b:a 56k -ac 1 -movflags +faststart out.mp4
   ffmpeg -ss 5 -i in.mp4 -frames:v 1 -vf "scale=-2:360" -q:v 6 out.jpg
   ```
4. **Host it on the site**, not on YouTube: `media/council/<YYYY-MM-DD>/<ID>.mp4`
   and `.jpg`. Keep each file under 25 MB and a sitting's clips under 100 MB.
   Self-hosted video contacts no third party, so the Privacy page does not
   change. (Jesse's own footage is different: that goes on the Stray Dog Media
   YouTube channel.)

## Embedding in an article

Use the article figure pattern, in both the EN and FR pages, same commit:

```html
<figure class="article-figure article-clip">
  <video controls preload="none" playsinline
         poster="/media/council/2026-09-08/A3.jpg">
    <source src="/media/council/2026-09-08/A3.mp4" type="video/mp4">
  </video>
  <figcaption>Council sitting of Sept. 8, 2026, 36:38 to 39:46.
    Recording: Municipalité d'Ormstown.
    <a href="https://www.youtube.com/watch?v=...&t=2198s">Full video</a></figcaption>
</figure>
```

- Caption every clip with the sitting date, the time in the full video, the
  source ("Recording: Municipalité d'Ormstown" / « Enregistrement :
  Municipalité d'Ormstown ») and a link to the full video.
- A clip shows what was said; the article still states only what was heard.
- Choose clips that carry the story: a decision, an answer to a question, a
  commitment. Not every citation needs one.
- No autoplay. `preload="none"` so pages stay light.
- In Notion, list the clip IDs on the Articles page so the sync does not drop
  the figure (figures already on the page are kept in place).

## Existing clips

The 11 clips behind the unlisted council working document live in
`en/briefing/council-2026-11-r8k4m2/clips/`. New clips go under `media/council/`.
