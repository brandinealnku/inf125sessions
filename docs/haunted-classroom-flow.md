# Haunted AI Lab: classroom flow update

For a new class, choose **Physical tables — students choose**, set table count and capacity, then create teams. Students join the table where they are sitting. The board lists table numbers and names; no location permissions or chat account is required. Table names and charms are supplied automatically, with optional customization.

Review the visible roster before starting training. Assign or move students with the table selector and **Assign**. An empty table does not block progress. Once training begins, existing team memberships are locked. Unassigned late arrivals can be placed by the Game Master and are excused from the current case's required actions; the next case includes them normally.

Student screens keep names and individual statuses visible: needs to vote, needs response review, needs evidence check, ready, or excused. Roles and how-to instructions are optional details. Instructor screens prioritize the current phase, next shared action, a short script, and the team roster. Full notes, discussion tools, bonus points and technical counts remain expandable.

**Advance Anyway** is beside the next phase action. It requires a confirmation describing unfinished work. It does not reset the room, fabricate completion or award a point to an incomplete team. **Excuse This Case** removes one student's required actions and can be reversed; use it for a device problem or absence.

Existing automatic assignment remains available. Existing active sessions are not reset, migrated or regrouped by deployment. Rebuilding teams is allowed only in the lobby and asks for confirmation in the instructor UI.

Validation: `node tests/haunted-qa-regression.mjs` covers all original cases and finale plus table capacity, simultaneous joins, moves, observer exclusion, training gates, locks, late arrivals, status rendering, forced scoring, empty tables, attention and spotlight controls.
