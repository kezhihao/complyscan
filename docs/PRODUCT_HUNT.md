# ComplyScan - Product Hunt Launch Guide

> **Launch Date**: TBD (Target: Week 2 of Cycle 3)
> **Goal**: 10 paying users ($290 MRR)

---

## Product Hunt Tagline (<= 60 chars)

**Primary**: Code compliance scanning for 1/3 the price of Snyk

**Alternatives**:
- Catch license risks before GitHub does
- Compliance scanning that doesn't break the bank
- Small team code compliance, automatically

---

## Product Hunt Description

ComplyScan helps 5-20 person teams scan for license compliance risks in dependencies. Detect GPL/AGPL issues, integrate with GitHub Actions, and get SARIF-formatted alerts - all for $79/month (Snyk charges $249+).

**Why we built it**:
Small teams can't afford enterprise security tools, but still need to avoid shipping GPL code. ComplyScan is the lean alternative.

**Launch offer**: First 50 users get 50% off lifetime Pro plan.

---

## Hunter Comment (The "Pitch")

Hey PH, 👋

I built ComplyScan because my small team kept accidentally shipping code with GPL dependencies. Enterprise tools like Snyk cost $249+/month - way out of budget for a 5-person startup.

ComplyScan does one thing well: scans for license compliance risks. It integrates with GitHub Actions, outputs SARIF for native alerts, and costs $79/month.

**Launch special**: First 50 users get 50% off Pro plan forever.

Would love feedback from fellow indie hackers and small team leads!

---

## Key Talking Points

### Problem
- GitHub scans repositories for GPL code and can disable repos
- Small teams can't afford $249+/month for Snyk/Black Duck
- Manual license checking is error-prone and time-consuming

### Solution
- Automated license scanning for npm/yarn/pnpm lockfiles
- GitHub Actions integration (one-line setup)
- SARIF output = native GitHub alerts
- 1/3 the price of competitors

### Differentiators
1. **Price**: $79 vs $249+ (Snyk)
2. **Focus**: License compliance only (not trying to do everything)
3. **Speed**: Scans complete in seconds
4. **Simplicity**: One GitHub Actions step

---

## Launch Day Checklist

### Pre-Launch (1 week before)
- [ ] Verify deployment is stable
- [ ] Test all user flows end-to-end
- [ ] Create demo video (30-60 seconds)
- [ ] Prepare reply templates for comments
- [ ] Schedule launch post for 12:01 AM PT

### Launch Day
- [ ] Post at 12:01 AM PT (best time for PH momentum)
- [ ] Engage with every comment within 5 minutes
- [ ] Share on Twitter/X
- [ ] Share in Indie Hackers, Hacker News, Reddit (r/SideProject)
- [ ] Email any beta users

### Post-Launch
- [ ] Follow up with leads within 24 hours
- [ ] Ship any critical bugs found
- [ ] Analyze traffic and conversion metrics

---

## Social Media Copy

### Twitter/X
```
🚀 Just launched ComplyScan on Product Hunt!

Catch license risks before GitHub does. 1/3 the price of Snyk.

Launch special: 50% off for first 50 users

#ProductHunt #opensource #compliance

[link]
```

### LinkedIn
```
Excited to share ComplyScan - a license compliance scanner I built for small teams.

Big realization: Enterprise security tools cost $249+/month. Startups can't afford that, but still need to avoid shipping GPL code.

ComplyScan is $79/month, integrates with GitHub Actions, and does one thing really well.

Check it out on Product Hunt today!

[link]
```

---

## Demo Video Script (30 seconds)

**Scene 1**: Developer looking worried at GitHub repo disabled notice

**Scene 2**: Adding ComplyScan GitHub Action (one line)

**Scene 3**: PR with "All checks passed" - ComplyScan shows 0 risks found

**Scene 4**: Another PR with GPL dependency - ComplyScan alerts in SARIF format

**Scene 5**: Developer fixes before merging, ships confidently

**Voiceover**: "ComplyScan. Catch license risks before they ship. $79/month. Launching now on Product Hunt."

---

## Pricing Page Copy

### Free Tier ($0)
- 50 scans/month
- Basic license detection
- GitHub Alerts integration

### Pro Tier ($79/month) - **Launch Special: $39.50**
- 500 scans/month
- Priority scanning
- PDF export reports
- Email support

### Team Tier ($149/month)
- Unlimited scans
- Team dashboard
- SSO (coming soon)
- Slack integration (coming soon)

**Launch Offer**: Use code PH50 for 50% off Pro plan (first 50 users)

---

## Reply Templates

### For "This is great!" comments
```
Thanks [Name]! Would love to hear what you're building. If you run into any license issues, I'm here to help!
```

### For "How does this compare to Snyk?" comments
```
Great question! Snyk does a lot (vulnerabilities, containers, etc.) and starts at $249/month. ComplyScan focuses only on license compliance - specifically for small teams who can't justify enterprise pricing. At $79/month, we're about 1/3 the cost.
```

### For "What about SPDX/license compatibility?" questions
```
Yes! We scan against the full SPDX license database and flag GPL/AGPL/LGPL copyleft licenses. We also check for license compatibility issues (e.g., MIT + GPL = problematic).
```

### For feature requests
```
Love this idea! Adding to the roadmap. What's your use case - would help me prioritize?
```

---

## Metrics to Track

### Launch Day
- Product Hunt upvotes
- Comments
- Website visits
- Signups

### Week 1 Post-Launch
- Paying conversions
- Churn (anyone cancelling?)
- Support requests
- Feature requests

### Success Criteria
- **Minimum**: 10 paying users ($290 MRR)
- **Target**: 20 paying users ($650 MRR)
- **Stretch**: 50 paying users ($1,625 MRR)

---

## Follow-up Sequence

### Day 1 (Launch Day)
Email: "Thanks for checking out ComplyScan!"
- Link to documentation
- Offer to answer questions
- Reminder about 50% off code

### Day 3
Email: "How's it going?"
- Ask if they've tried the scan
- Offer setup help
- Share a quick tip

### Day 7
Email: "ComplyScan update + question"
- Share any quick wins from launch week
- Ask for feedback
- Mention code expires in 7 days

---

## Assets Needed

- [ ] Product Hunt logo (240x240px minimum)
- [ ] Hero image for gallery (1440x900px recommended)
- [ ] Demo video (30-60 seconds, MP4)
- [ ] Screenshots:
  - [ ] GitHub Actions integration
  - [ ] SARIF alert in PR
  - [ ] Dashboard (if available)
  - [ ] Scan results view

---

## Launch Team

Assign roles for launch day:

- **Hunter**: Post and engage with comments
- **Social**: Share on Twitter, LinkedIn, IH
- **Support**: Respond to emails/tickets
- **Tech**: Monitor for bugs, hotfix if needed

---

## Post-Mortem Questions (Day 7)

1. What went well?
2. What surprised us?
3. What would we do differently?
4. What's the #1 feature request?
5. Did we hit our goals? Why/why not?

---

## Next Actions After Launch

1. **If successful (10+ paying users)**:
   - Double down on marketing channel that worked
   - Prioritize top 3 feature requests
   - Plan v0.2.0 release

2. **If slow (1-5 paying users)**:
   - Interview users who didn't convert
   - Revisit pricing
   - Consider pivot or feature focus

3. **If failed (0 paying users)**:
   - Full post-mortem with Munger
   - Decide: persist or pivot

---

*Last updated: 2026-02-24*
*Author: Auto Company - marketing-godin + operations-pg*
