## GitHub Copilot Chat

- Extension Version: 0.28.2025052901 (prod)
- VS Code: vscode/1.101.0-insider
- OS: Windows

## Network

User Settings:
```json
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 140.82.121.5 (3 ms)
- DNS ipv6 Lookup: Error (19 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): HTTP 200 (29 ms)
- Node.js https: HTTP 200 (108 ms)
- Node.js fetch: HTTP 200 (96 ms)
- Helix fetch: HTTP 200 (143 ms)

Connecting to https://api.individual.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.112.22 (6 ms)
- DNS ipv6 Lookup: Error (16 ms): getaddrinfo ENOTFOUND api.individual.githubcopilot.com
- Proxy URL: None (13 ms)
- Electron fetch (configured): Error (52 ms): Error: net::ERR_CERT_COMMON_NAME_INVALID
    at SimpleURLLoaderWrapper.<anonymous> (node:electron/js2c/utility_init:2:10635)
    at SimpleURLLoaderWrapper.emit (node:events:518:28)
- Node.js https: HTTP 200 (299 ms)
- Node.js fetch: HTTP 200 (310 ms)
- Helix fetch: HTTP 200 (316 ms)

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).