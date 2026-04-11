function formatLineRange(finding) {
  if (!finding.line_start) {
    return "";
  }
  if (!finding.line_end || finding.line_end === finding.line_start) {
    return `:${finding.line_start}`;
  }
  return `:${finding.line_start}-${finding.line_end}`;
}

function severityRank(severity) {
  switch (severity) {
    case "critical":
      return 0;
    case "high":
      return 1;
    case "medium":
      return 2;
    default:
      return 3;
  }
}

export function renderSetupReport(report) {
  const lines = [
    "# Claude Review Setup",
    "",
    `Status: ${report.ready ? "ready" : "needs attention"}`,
    "",
    `- claude: ${report.claude.detail}`,
    `- auth: ${report.auth.detail}`,
    `- default quality profile: ${report.defaults.model} / ${report.defaults.effort}`
  ];

  if (report.nextSteps.length) {
    lines.push("", "Next steps:");
    for (const step of report.nextSteps) {
      lines.push(`- ${step}`);
    }
  }

  return `${lines.join("\n")}\n`;
}

export function renderReviewResult(snapshot, result, job = null) {
  const findings = [...result.parsed.findings].sort((left, right) => severityRank(left.severity) - severityRank(right.severity));
  const lines = [
    `# Claude ${snapshot.reviewLabel}`,
    "",
    `Target: ${snapshot.targetLabel}`,
    `Model: ${snapshot.model}`,
    `Effort: ${snapshot.effort}`,
    `Profile: ${snapshot.profile}`,
    `Context mode: ${snapshot.contextMode}`,
    `Verdict: ${result.parsed.verdict}`
  ];

  if (job) {
    lines.push(`Job: ${job.id}`);
  }

  if (snapshot.notes?.length) {
    lines.push("", "Notes:");
    for (const note of snapshot.notes) {
      lines.push(`- ${note}`);
    }
  }

  lines.push("", result.parsed.summary, "");

  if (findings.length === 0) {
    lines.push("Findings: none.");
  } else {
    lines.push("Findings:");
    findings.forEach((finding, index) => {
      lines.push(
        `${index + 1}. [${finding.severity}] ${finding.title} (${finding.file}${formatLineRange(finding)})`
      );
      lines.push(finding.body);
      if (finding.recommendation) {
        lines.push(`Recommendation: ${finding.recommendation}`);
      }
      lines.push("");
    });
  }

  if (result.parsed.next_steps?.length) {
    lines.push("Next steps:");
    for (const step of result.parsed.next_steps) {
      lines.push(`- ${step}`);
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

export function renderStatusReport(jobs, cwd) {
  const lines = [
    "# Claude Review Status",
    "",
    `Workspace: ${cwd}`
  ];

  if (jobs.length === 0) {
    lines.push("", "No review jobs found.");
    return `${lines.join("\n")}\n`;
  }

  for (const job of jobs) {
    lines.push("", `- ${job.id} | ${job.status} | ${job.kind} | ${job.title}`);
    if (job.model) {
      lines.push(`  Model: ${job.model} / ${job.effort}`);
    }
    if (job.summary) {
      lines.push(`  Summary: ${job.summary}`);
    }
    if (job.logTail?.length) {
      lines.push("  Progress:");
      for (const line of job.logTail) {
        lines.push(`  ${line}`);
      }
    }
  }

  return `${lines.join("\n")}\n`;
}

export function renderCancelReport(job, cancelled) {
  return `# Claude Review Cancel\n\nJob: ${job.id}\nStatus: ${cancelled ? "cancelled" : "unable to cancel"}\n`;
}
