# DSAR bulk action improvements: interactive prototype

This is a clickable prototype of the Privacy Rights Automation **Requests** queue. It covers the
Bulk Action Improvements PRD (internal; kept out of this repo) and is built with
components and tokens from the [Vitreus design system](https://github.com/KCM-OT/kcm-vitreus-design-system).
All data is mock data held in the browser. Nothing calls a real backend.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3100.

## What to try

| PRD story | Where |
| --- | --- |
| 1. Seeded saved views | The view picker ("All requests"). Standard, Confirmed and Suspected counts add up to All. A request moves view when the list refreshes, which happens automatically when a job finishes or when you click Refresh. |
| 2. Add comment | Bulk bar, **Add comment**. It has Public and Internal tabs, templates, attachments, the Reply split button (as completed, rejected or extended), and a confirmation step with skip reasons. |
| 3. Complete | Bulk bar, **Complete**. The button is greyed out with a tooltip when none of the selected requests is eligible. |
| 4 and 5. Flag and remove flag | Bulk panel **⋯**, under Automation flag. You can optionally pick a workflow, and the summary breaks down "flag + workflow" against "flag only". The same actions are on a single request: click its ID to open the detail page, then use the header **⋯** menu. |
| 6. Change workflow | Bulk bar, **Change workflow**. It has the "Delete subtasks currently open" toggle, and a workflow is disabled when every selected request is already in it. |
| 7. Progress and outcome | After you submit, the action modal shows a loader until the job finishes. On success it closes and a Success toast appears, with its bar filling over one second. Errors, an abort or a failed start open the progress modal's result view instead. Closing the modal while it loads leaves the job running in the tray at the bottom right. |
| 8. Reliable execution | "Select 500 items" replaces "Select all X items". Overlapping jobs queue up. |
| 9. Abort and retry | **Abort** asks you to confirm, then the current batch finishes and nothing is rolled back. Use **Retry failed** or **Retry** to run it again. |

**Prototype controls** (bottom left) let you force each outcome. You can set the failure rate and
processing speed, make the next job fail to start, or drop the connection during the next job. You
can also reset the mock data.

## Request detail page

Click a request ID to open `/requests/<ID>`, a copy of the QA detail page. It has the header with the stage badge and a ⋯ menu, the left details column, the request card with Show more, the stage path with Advance, the stage guidance, and the ID verification, Subtasks, Activity and History tabs. Posting a comment, Advance, Reject, Close, Extend, Change workflow and the flag actions all work. The other menu items show a "not wired up" note.

## Prototype assumptions (not in the PRD)

- The queue gains **Automation flag** and **Workflow** columns. Organization and Approver are hidden
  because they're the same for every row of mock data.
- **Add comment** is a single action with Public and Internal tabs. Skipped requests show as counts
  per reason, with an expandable list.
- Changing workflow keeps the request's current stage.
