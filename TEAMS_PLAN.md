# MeenitsTrac — Teams plan & tracker

> Decided 2026-06-08. Model: **team owns projects** (membership = access), mirroring MeenitsApp
> organizations + Jira. Invitations: **email links** (register-to-join). Mark `[x]` as done.

## Model
```
teams ──< team_user >── users         roles: owner / admin / member
  │                                    solo user = a 1-person "personal" team
  └──< projects ──< tasks              access to a project = membership of its team
team_invitations (email + token) → register/login → auto-join
```
- `current_team_id` in session = the active team context (a switcher, like MeenitsApp's current org).
- Assignee pickers scope to the project's **team members** (fixes today's all-users leak).
- Integration: pushed action items land in the token-owner's **current team**; connection stores `team_id` for future Meenits-org→Trac-team mapping.

## Stages
### Stage 1 — Schema + models + backfill ✅ (2026-06-08, migrated + tested)
- [x] Migration: `teams`, `team_user`, `team_invitations`; `projects.team_id`.
- [x] Backfill: personal team per existing user, projects reassigned (verified users==teams).
- [x] Models: `Team` (+ `createPersonalFor`), `TeamInvitation`; `User` (teams/ownedTeams/currentTeam/belongsToTeam); `Project` (team()).
- [x] Registration auto-creates the user's personal team.
- App still behaves as single-owner until Stage 2 flips access.

### Stage 2 — Team context + switcher + team-scoped access ✅ (2026-06-09, tested)
- [x] `current_team_id` session + `currentTeam()` (defaults to user's OWN team); shared `currentTeam` + `teams`.
- [x] Sidebar **team switcher** (Dropdown, posts `teams.switch`); Boards dropdown + all listings scoped to current team.
- [x] Replaced Project `owner` scope with **team-membership** global scope (security chokepoint); updated Project/Task/Backlog/Issue/Dashboard controllers + integration (`team_id`).
- [x] Project create sets `team_id`; assignee pickers + validation scoped to team members.
- **Verified:** cross-team isolation (no leak), sharing (multi-team member sees both), default = own team, switching works.

### Stage 3 — Members & invitations (email links) ✅ (2026-06-09, implemented & tested)
- [x] Team settings page: members + roles, remove, change role.
- [x] Invite by email → `team_invitations` + mail + accept (register/login → join).

### Stage 4 — Meenits integration mapping (later)
- [ ] Map a connected Meenits org → a Trac team so action items feed a shared team board.
