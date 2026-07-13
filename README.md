# Ryan Hall Guitar — Preview Build, Homepage Revision 3

This is a pre-deployment static preview for `ryanhallguitar.com`.

## Preview locally on Windows

Double-click `preview.bat`. Then open:

`http://localhost:8080`

Press `Ctrl+C` in the command window to stop the preview server.

## Homepage revision 3

The homepage now uses **The Deep End of Time** as its full-screen film background. The background starts muted, loops continuously, and includes a small play/pause control. A separate mobile encode preserves the complete widescreen composition rather than cropping the principal imagery. The floating photographs remain atmospheric and non-clickable.

The full video with audio remains available from the Videos page; the homepage copies contain no audio track.

## GoDaddy deployment later

After approval, upload the **contents** of this folder to the domain's web root (commonly `public_html`) using GoDaddy File Manager or SFTP. Do not upload the enclosing folder itself unless the hosting account is configured to use it as the document root.

Before public deployment:

1. Replace the preview notice on `contact.html` with the approved contact route.
2. Confirm which recordings and videos are public.
3. Add final creation notes and credits to the files in `songs/`.
4. Confirm DNS points the domain at the correct GoDaddy hosting account.
5. Enable HTTPS and test both `ryanhallguitar.com` and `www.ryanhallguitar.com`.

## Fonts

The CSS requests local `Chicago Classic` and `MS DOT Gothic 16`. It also uses the web-hosted `DotGothic16` as a fallback. No font files are included in this package.
