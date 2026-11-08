---
name: git-commit-push
description: >-
  Inspects git diff and status, stages relevant changes safely, generates a semantic
  Conventional Commit message matching the changes, commits them, and pushes to GitHub.
  Use whenever the user asks to "commit and push", "push to github", "save changes to git",
  or asks to create a commit message and push.
---

# Git Commit and Push Skill

Automates inspecting repository changes, generating high-quality Conventional Commit messages, committing, and pushing to the remote git branch.

---

## Workflow Procedure

Follow these steps in order when executing this skill:

### Step 1: Inspect Status & Diff
1. Check repository status:
   ```bash
   git status
   ```
2. Inspect the exact changes:
   ```bash
   git diff
   git diff --cached
   ```
3. If no changes exist (`nothing to commit, working tree clean`), inform the user and stop early.

---

### Step 2: Safety & Secret Guardrail
Before staging files, verify that sensitive files are NOT being added:
- Verify `.env`, `.env*.local`, secrets, API keys, credentials, or private keys are covered in `.gitignore`.
- Run:
  ```bash
  git check-ignore -v <file>
  ```
- If a sensitive file is tracked or untracked without ignore rules, alert the user and add it to `.gitignore` before proceeding.

---

### Step 3: Stage Files
Stage modified and untracked project files:
```bash
git add <file1> <file2> ...
```
*(Or `git add .` if all untracked files are verified safe).*

> [!NOTE]
> On Windows with sandbox execution, if writing to `.git/objects` fails with a permission check, run the git command with `BypassSandbox: true`.

---

### Step 4: Generate a Semantic Commit Message
Analyze the staged diff and construct a message adhering strictly to **Conventional Commits**:

#### Format:
```text
<type>(<scope>): <concise description in imperative mood>

[optional body explaining motivation and key changes]
```

#### Commit Types:
- `feat`: A new user-facing feature or capability
- `fix`: A bug fix or unexpected behavior resolution
- `refactor`: Code restructuring without behavioral change
- `perf`: Performance improvement
- `style`: CSS, theme, formatting, or layout styling
- `test`: Adding or updating test cases
- `docs`: Documentation, README, or plan changes
- `chore`: Tooling, dependencies, `.gitignore`, or config updates

#### Rules:
1. Use lowercase for the type and scope (e.g., `feat(auth):`, `fix(navigation):`, `style(appbar):`).
2. Keep the subject line under 72 characters, written in the imperative mood (*"add Google OAuth"* instead of *"added Google OAuth"*).
3. Do not include vague messages like *"update files"* or *"minor changes"*.

---

### Step 5: Commit Changes
Commit the staged changes with the generated message:
```bash
git commit -m "<generated commit message>"
```

---

### Step 6: Push to Remote
1. Determine current active branch:
   ```bash
   git branch --show-current
   ```
2. Push to the remote repository:
   ```bash
   git push origin <branch>
   ```
   *(Note: Network commands require unsandboxed execution if network isolation is active).*

---

### Step 7: Verify and Report
1. Verify working directory is clean:
   ```bash
   git status
   ```
2. Report the result clearly to the user:
   - **Commit SHA**: e.g., `abc1234`
   - **Commit Message**: The exact generated message
   - **Branch**: Target remote branch (e.g., `main -> origin/main`)
   - **Remote Link**: Link to the commit on GitHub if remote URL is available
