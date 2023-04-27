# Discord Countdown Bot

A serverless Discord bot powered by Cloudflare Workers, commissioned by a *Heartstopper* fan server.
It should be easy to adapt this for other events, just note that it currently counts down to a fixed UTC time, not the time in each timezone.

> **Note** Use <https://christmascountdown.live/discord> if you want a countdown to Christmas.

## Features

- Daily webhook to a single guild
- Pre-generated countdown images
- `/countdown` command for the exact time left (in the user's timezone)
- `/timezone` command to set the user's timezone (stored in KV)