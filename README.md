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
| 4 and 5. Flag and remove flag | Bulk bar **⋯**, under Automation flag. You can optionally pick a workflow, and the summary breaks down "flag + workflow" against "flag only". The same actions are on a single request in its details drawer: click a request ID, then **Actions**. |
| 6. Change workflow | Bulk bar, **Change workflow**. It has the "Delete subtasks currently open" toggle, and a workflow is disabled when every selected request is already in it. |
| 7. Progress modal | Opens for every bulk action. It shows batches of 20 and "X of Y processed". **Minimize** sends the job to a tray at the bottom right, and a toast plus a notification-bell entry appear when it finishes. |
| 8. Reliable execution | "Select 500 items" replaces "Select all X items". Overlapping jobs queue up. |
| 9. Abort and retry | **Abort** asks you to confirm, then the current batch finishes and nothing is rolled back. Use **Retry failed** or **Retry** to run it again. |

**Prototype controls** (bottom left) let you force each outcome. You can set the failure rate and
processing speed, make the next job fail to start, or drop the connection during the next job. You
can also reset the mock data.

## Prototype assumptions (not in the PRD)

- The queue gains **Automation flag** and **Workflow** columns. Organization and Approver are hidden
  because they're the same for every row of mock data.
- **Add comment** is a single action with Public and Internal tabs. Skipped requests show as counts
  per reason, with an expandable list.
- Changing workflow keeps the request's current stage.
