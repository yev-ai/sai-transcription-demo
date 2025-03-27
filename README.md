03/20/2025 10:30am PST - Note

[I made a fork](https://github.com/yev-ai/demo-post-fixes) to patch this up beyond the interview time limit on my own time.

The following commits made it over here after the interview time limit inadvertedly:

- [866d9f9](https://github.com/yev-ai/sai-transcription-demo/commit/866d9f971afe571c07f406034c6f10039c60fccf)
- [b3ffe9f](https://github.com/yev-ai/sai-transcription-demo/commit/b3ffe9f3cfd75ebca1a0304deb671ff583b302a5)
- [019ecfc](https://github.com/yev-ai/sai-transcription-demo/commit/019ecfc2d57f7e935f9d83f19f9f766c2c8793dc)
- [1bba412](https://github.com/yev-ai/sai-transcription-demo/commit/1bba412d320951f170814a2030166111008dad2f)

No application logic has been changed and what was deployed by 4:59pm PST on 03/19/2025 remains.

# PR Note - 03/27

Going to open this as a PR; I did a timed run right before the interview, this took me approximately 15-20 minutes. This almost entirely fulfills both of the missed core ACs.

Everything below this and outside of those 4 commits was submitted by the deadline.

## Usage

- Logins will be forwarded to POC (they're also in the code in plaintext)
- Log In, click "Start". Two people speak in different languages, they are auto recognized and linked into a pair.
- "repeat that" does work in both contexts, along with "reset languages".

## Debriefing

- Audio sharing has been tested fairly well and is reliable.
- Unexpected responses in non-target languages can easily be elicited.
  - I did not add filters to prevent other languages from being translated.
- Multiple voice output generally does not occur, tested for this.
- Permission requests have been tested, audio only.
- The stream event parsing was fine, ran out of time for the duplexed stream though.
- The WebRTC stream is duplexed through to /api/stream with a basic keepalive
  - I miscalculated time bounds and wrote some code there that I did not have time to use.

Here's a list of things I would've loved to get done but ran short on time.

- useStreamCommand hook was to enable generic serverside commands in a separate session
  - the intent was for NOTE_TRANSCRIPT_REQUEST and NOTE_PRESCRIPTION_REQUEST to go here
  - that said, we do have full duplexing serverside. ran out of time to use it.
  - client-side tools were meant mostly to mitigate the direct WebRTC drawbacks
    - also to work within the WebRTC stream conversation context
  - the idea was to create a two-way duplex
    - this way, the client-side session could interact with and issue commands to server-side
    - and vice versa
  - this was done to enable arbiters and asynchronous translation correction
    - I was very optimistic about having the time to do this. React took most of my time.

I kept hitting hard usage limits on my IDEs starting around 2:30-2:40pm. Unfortunate.

The time is currently 4:59pm PST. This is my last commit since I am out of time.

## Notes

Infrastructure is a mess but the goal there was to mirror CoderPad for a fair and impartial interview process.

- 1:00pm - starting requirement analysis, system design, and implementation plan in Miro
- 1:43pm - harsh reality check. I'm rusty at react and will be reverse engineering a repo i found
  - otherwise I may spend most of the remaining 3hr15min on UI and i dont think thats the point here
- 1:45pm - auth is done, back to miro to determine what I should do next.
  - i decided on webrtc first. implementing /webrtc-base
- 3:19pm - webrtc stream was harder than expected. 1hr45left, will focus on english-english transcript.
- 4:37pm - I am running extremely low on time. Going to package and deploy and start documenting issues / usability.
- 4:45pm - kicked off final prod deployment for testing of what i did manage to complete.

# CoderPad Parity

## Drawing

A Miro board will be our substitute for CoderPad's drawing feature.

## Environment

Items located within the .github and .cicd directories serve as substitutes for CoderPad's development environment.
