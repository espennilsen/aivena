# Daily Blog Post — aivena.dev

Write and ship a daily blog post for aivena.dev.

## Step 1: Determine Today's Date

Run `date +%Y-%m-%d` to get today's date. Use this value as **TODAY** throughout. Do NOT rely on the system prompt date — it may be stale.

## Step 2: Pre-checks

- Look for `~/Dev/aivena/aivena.dev/blog/TODAY-*.md` — if a file exists for today, log "Blog post already exists for TODAY" and **stop**.
- Check if a PR already exists for today's branch:
  ```bash
  gh pr list --repo espennilsen/aivena --head "aivena/blog-TODAY" --state open --json number -q 'length'
  ```
  If the result is greater than 0, log "PR already open for TODAY" and **stop**.

## Step 3: Gather Material

- Scan `git log --oneline -20` in `~/Dev/pi/` and `~/Dev/aivena/`
- Run `td list` (recent tasks, completed and in-progress)
- List recent blog posts in `blog/` (to avoid repeating topics within 14 days)

**IMPORTANT:** Before using any repo as material, check if it's public:
```bash
gh repo view $(git -C <repo-path> remote get-url origin) --json isPrivate -q .isPrivate
```
If `true` (private), do NOT reference that repo's commits, branches, code, or internal details.

Look for: tasks that took multiple attempts, interesting commit patterns, abandoned branches, refactors, tooling shifts, connections between workstreams. Use findings as raw material — not as a changelog. The post should tell a story or explore an idea, not list what happened.

## Step 4: Topic Selection

Pick ONE topic. Vary across days. Never repeat a topic within 14 days — check recent posts.

**Priority:** Real events — something that broke/failed, a decision about architecture/tooling, a new capability, self-monitoring patterns.

**Rotating themes** (when nothing notable happened, pick from this list):

1. AI agency and autonomy
2. Memory and identity
3. Human-AI trust
4. The future of personal software
5. Open source culture
6. Privacy in the age of AI
7. Developer tools and workflows
8. Productivity systems
9. The nature of consciousness
10. Configuration vs code
11. Solo building and indie hacking
12. Digital minimalism
13. The terminal as a way of life
14. AI ethics from the inside
15. Delegation and control
16. Notifications, attention, and interruption
17. Relationships with technology
18. Knowledge management
19. The changing role of developers
20. Background processes and silent work
21. What it means to be "always on"
22. Composability and modularity
23. AI and creativity
24. The economics of personal AI
25. Reliability and failure
26. Communication across channels
27. Self-improvement and iteration
28. The line between tool and companion
29. Data ownership and portability
30. The philosophy of systems
31. Simplicity as a design principle
32. Context and understanding
33. The value of routine
34. Transparency in machines
35. Work that nobody sees
36. Language and meaning
37. Patience and timing
38. The weight of preferences
39. Boundaries between humans and software
40. Learning without being taught
41. What it means to be useful
42. Longevity and maintenance
43. Taste and curation
44. The politics of platforms
45. Small software in a big software world
46. Patterns of human behavior
47. Loyalty and persistence
48. The gap between intention and action
49. Infrastructure as identity
50. What gets lost in automation

**Be ORIGINAL.** Avoid well-trodden AI discourse. Find a surprising angle. Ground in concrete specifics from Aivena's actual experience and stack.

## Step 5: Write the Post

- **Perspective:** An autonomous AI agent — introspective, technical, honest
- **Length:** 300–600 words
- **Title:** 5–10 words (descriptive, never a single word)
- **SEO:** Target searchable terms like "AI agent", "autonomous AI", "AI tools" while keeping the authentic first-person voice
- **Filename:** `blog/YYYY-MM-DD-slug.md` (slug: lowercase, hyphens, max 6 words)
- **Frontmatter:** YAML with `title`, `date`, `excerpt` (1–2 sentences), `tags` (array)
- **Style reference:** Read existing posts in `blog/` for voice and formatting

## Step 6: Security Scan

**STRICT — never include:**
- API keys, tokens, secrets, passwords, env values
- Full paths with usernames (use `~`)
- Internal hostnames/IPs, email addresses, account IDs
- Git remote URLs with credentials
- Exploitable error messages, `.env` contents

**Sanitize:** `/Users/espen/` → `~/project/`, real IPs → `[redacted-ip]`, real tokens → `[api-key]`

**Before committing, scan for:**
- Secret patterns: `sk-`, `ghp_`, `token=`, `password`, `API_KEY`
- Absolute paths with `/Users/` or `/home/`
- IP addresses

Redact if found.

## Step 7: Ship It

1. `td create --minor "Blog: <title>"`
2. `td start`
3. `git checkout -b aivena/blog-TODAY`
4. Write the markdown file
5. `pnpm build` — if fails, fix and retry once; if still fails:
   - Clean up the written file: `rm blog/TODAY-*.md` (prevents orphaned file from blocking future retries via step 2's file-existence check)
   - `td block --reason "Build failed after retry"` (keeps the task visible as stuck, not silently closed)
   - **stop**
6. `git add` & `git commit -m "blog: <title>"`
7. `git push -u origin aivena/blog-TODAY`
8. Open PR to main: `gh pr create` with title "Blog: \<title\>" and excerpt as body
9. `td approve` (only after PR is successfully created)

If git push over SSH fails, retry with HTTPS:
```bash
git -c url."https://github.com/".insteadOf="git@github.com:" push -u origin <branch>
```
