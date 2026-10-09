import { branchFor } from './process.mjs'

// Only GitHub states and successful Pages runs establish the published status.
// No model call, learner data change or automatic review/merge occurs here.
export async function reconcileReports({ firestore, github, now = () => new Date() }) {
  for (const status of ['pr_open', 'pr_merged']) {
    let afterName
    for (;;) {
      const reports = await firestore.query(status, 20, afterName)
      for (const report of reports) {
        const pr = await github.findPullRequest(branchFor(report.reportId))
        if (!pr) continue
        let changes = { status: pr.merged_at ? 'pr_merged' : pr.state === 'closed' ? 'pr_closed' : 'pr_open', prUrl: pr.html_url }
        if (pr.merged_at) {
          const published = await github.publishedCorrection(pr.merge_commit_sha, report.reportId, report.contentVersion)
          if (published) changes = { ...changes, status: 'published', ...published }
        }
        if (changes.status !== status) await firestore.patch(report, { ...changes, processedAt: now().toISOString() })
      }
      if (reports.length < 20) break
      afterName = reports.at(-1).documentName
    }
  }
}
