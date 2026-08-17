# Contributing to OpenChat (Randall)

## Welcome
Thank you so much for your interest in contributing to this project! We are thrilled to have you here. Whether you're an experienced developer or this is your very first time contributing to open source, all skill levels are welcome. Our community is built on helping each other learn and grow, so please don't hesitate to jump in!

## Ways to contribute
Contributing isn't just about writing code. There are many valuable ways you can help improve the project:
- **Reporting bugs:** Found a glitch? Let us know by opening an issue (link to issue template).
- **Suggesting features:** Have a great idea? We'd love to hear it!
- **Improving documentation:** See a typo or a confusing explanation? Documentation fixes are incredibly helpful.
- **Fixing typos:** Found a spelling mistake in the code or docs? Quick PRs for these are always appreciated.
- **Writing tests:** Help us keep the codebase robust and reliable.
- **Helping other users:** Answer questions and provide guidance to others in the Issues section.

## Your first contribution
Getting started is easier than you might think! Here's a step-by-step guide:

1. **Find an issue:** Look for issues labeled `good first issue`. These are specifically chosen because they are great starting points that don't require deep knowledge of the entire codebase.
2. **Fork the repository:** Click the "Fork" button at the top right of this page to create your own copy of the project.
3. **Clone your fork:** Download your copy to your local machine.
   ```bash
   git clone https://github.com/YOUR_USERNAME/openchat.git
   cd openchat
   ```
4. **Create a branch:** Make a new branch for your changes. Use a descriptive name!
   ```bash
   git checkout -b feat/text-chat-emoji
   # or
   git checkout -b fix/ws-reconnect
   ```
5. **Make your changes:** Write your code, fix that typo, or update the docs.
6. **Test your changes:** Ensure everything works as expected (see the Development Setup section below).
7. **Commit and Push:** Save your changes and push them to your fork.
   ```bash
   git add .
   git commit -m "feat: add emoji reactions"
   git push origin feat/text-chat-emoji
   ```
8. **Open a Pull Request (PR):** Go to the original repository and click "New pull request".

**Got stuck?** No worries at all! Just open a Draft PR with what you have so far and ask for help in the comments. We're here to support you.

## Development setup
Setting up the project locally is straightforward.

### Running the Backend Only
If you're working on server-side logic:
```bash
# Terminal 1 (From the root of the project)
npm install
npm run dev
```

### Running the Frontend Only
If you're tweaking the UI:
```bash
# Terminal 2
cd ui
npm install
npm run dev
```

### Testing WebRTC Locally
To test an actual video call on your machine:
1. Start both the backend and frontend.
2. Open your browser and go to `http://localhost:5173` (or whichever port the frontend uses).
3. Open a **new Incognito/Private window** and go to the same URL.
4. You can now test the connection between the two tabs!

### Common Errors and Fixes
- **Camera permission denied:** Make sure your browser has permission to access your camera and microphone. You may need to click the camera icon in the URL bar to allow access.
- **WebSocket connection refused:** Ensure the backend server is running and that your frontend is pointing to the correct local port (usually defined in your `.env` file).
- **Black video screen:** This is a common WebRTC gotcha. Check your browser console for ICE candidate errors. Sometimes, a simple page refresh in both tabs resolves local negotiation hiccups.

## Code style
We like to keep things simple and readable:
- **No strict linter:** We don't enforce a strict linter, but please try to follow the style of the surrounding code in the file you're editing.
- **Tailwind CSS:** We use Tailwind utility classes for styling. Please avoid adding custom CSS unless it's absolutely necessary.
- **Clarity is key:** Use descriptive variable names. If you write a piece of logic that isn't immediately obvious, leave a helpful comment explaining *why* it does what it does.
- **Clean up:** Please make sure to remove any debugging `console.log` statements before submitting your PR.

## Making a pull request
When you're ready to share your work:
- **Description:** Provide a clear description of what your PR does and why it's needed.
- **Link issues:** If your PR fixes an open issue, include "Closes #12" (replace 12 with the issue number) in the description so GitHub closes it automatically.
- **The Review Process:** Once you open a PR, a maintainer will review it, usually within a few days. We might ask for some small changes—this is a normal part of the process!
- **Don't worry about being perfect:** We don't expect flawless code on the first try. Maintainers are happy to help you get your PR across the finish line.

## Commit message format
We use a simple conventional commit format. It helps keep our history clean and easy to read. Please start your commit messages with one of these prefixes:
- `feat:` for new features (e.g., `feat: add emoji reactions`)
- `fix:` for bug fixes (e.g., `fix: reconnect on ws drop`)
- `docs:` for documentation changes (e.g., `docs: update setup instructions`)
- `chore:` for routine tasks, dependencies, etc. (e.g., `chore: bump dependencies`)

## What NOT to do
To keep things running smoothly and prevent frustration for everyone, please avoid the following:
- **Don't open a PR for a large new feature without discussing it first.** Please open an issue to propose your idea before writing a lot of code, so we can make sure it aligns with the project's goals.
- **Don't commit `.env` files.** Keep your secrets secret!
- **Don't add new dependencies without discussing it first.** We try to keep our footprint small.
