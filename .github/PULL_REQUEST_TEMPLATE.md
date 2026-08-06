<!-- Agent: fill in the five header lines below and nothing else. Do not tick
     a checkbox, do not write in Accepted deviations, do not write a Decision.
     Those are the HITL's, and an agent filling them destroys the review. -->

Task: task-0NN
Attempt: N
Preview URL:
REQ ids covered:
AC ids covered:

## Evidence produced without me

- [ ] CI is green on the latest commit of this branch
- [ ] Coverage check green: every AC id in ACCEPTANCE.md has a matching test
- [ ] A vendor that did not write this code has reviewed it, and its findings
      are in a comment on this pull request

## My review

- [ ] Implementation satisfies the approved requirements listed above
- [ ] I opened the preview URL and confirmed every AC id above by hand
- [ ] Threat model still holds, or the change is stated below and I accept it
- [ ] Reviewer findings are resolved, or accepted below with a reason
- [ ] Nothing outside allowed_paths was changed
- [ ] Fit for its intended purpose in this release

## Which AC ids I actually exercised in the preview

<List them. If this list is shorter than the AC ids above, say why.>

## Accepted deviations

<Findings or gaps I am knowingly accepting, and the reason. "None" is a valid
answer and must be written, not left blank.>

## Decision

ACCEPT / REJECT

Reason:

---
After ACCEPT: append one line to product/DECISIONS.md with the date, the task
id, the decision, and this pull request URL.
After REJECT: delete the branch, increment the attempt counter in
project.state.yaml, and restart from the last approved commit.
