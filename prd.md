# FeedbackSimple - PRD

## Product Overview
Simple feedback collection tool for indie hackers and small teams. Users embed a widget on their site, collect feedback with ratings, and manage responses through a clean dashboard.

## Market Opportunity
**Target Market:** Indie hackers, solo developers, small startups (2-20 people)
**Problem:** Need simple feedback collection without complex feature voting systems
**Competition:** FeedbackFast ($9-99 lifetime), Canny ($50+/month - overkill)
**Our Advantage:** Better UX, competitive lifetime pricing, developer-focused

## Core Value Proposition
"Collect user feedback in 5 minutes. Embed our widget, get insights, improve your product. One-time payment, lifetime access."

## Feature Set

### MVP (Phase 1)
**Feedback Widget**
- Small trigger button/tab (e.g., "Feedback", "💬") positioned on customer's website
- Embeddable JavaScript widget with customizable colors, position, trigger text
- Clicking trigger opens popup dialog with 3-field form:
  - "What's on your mind?" (required text area)
  - "What type of feedback?" (required dropdown: General/Bug/Feature/Praise)
  - "Want a reply?" (optional email field)
- Auto-captured: Page URL, timestamp, browser/device info
- Mobile responsive popup dialog

**Admin Dashboard**
- View all feedback in timeline
- Filter by category, date, status
- Auto-categorized feedback (from user selection)
- Respond to users directly
- Mark as read/unread

**Notifications**
- Email alerts for new feedback
- Daily/weekly summary emails
- Slack integration (webhook)

**Analytics**
- Total feedback count by category
- Feedback trends over time
- Response time metrics
- Page-specific feedback insights
- Simple charts and trends

### Phase 2 (6+ months)
- Custom fields in feedback form
- API for integrations
- Export data (CSV/JSON)
- Team collaboration features

## Tech Stack
- **Frontend:** Next.js 15 + TypeScript + Tailwind + shadcn/ui
- **Backend:** Next.js API routes + Prisma
- **Database:** Supabase PostgreSQL
- **Hosting:** Railway
- **Payments:** Polar.sh (lifetime deals)
- **Notifications:** Resend (email), webhooks
- **Widget:** Vanilla JS (lightweight embed)

## User Experience

### Customer Onboarding
1. Sign up → Verify email
2. Create project → Get embed code
3. Customize widget appearance (colors, position, trigger text)
4. Copy/paste JavaScript code into website
5. Widget appears as small trigger button on site
6. Receive first feedback → Success!

### Feedback Flow
1. User clicks small trigger button/tab on customer's website
2. Popup dialog opens with 3-field form:
   - "What's on your mind?" (required text area for message)
   - "What type of feedback?" (required dropdown: General/Bug/Feature/Praise)
   - "Want a reply?" (optional email field)
3. User fills form and clicks "Send Feedback"
4. Success message → popup closes
5. Admin gets notification with feedback + auto-captured context (page URL, category, device info)
6. Admin can respond from dashboard (if email was provided)
7. User receives response via email

## Pricing Strategy

### Monthly Subscription Model
**Starter - $9/month**
- 1 website
- Unlimited feedback
- Basic customization
- Email notifications
- 7-day free trial (credit card required)

**Pro - $19/month** 
- 3 websites  
- All Starter features
- Slack integration
- Advanced analytics
- Priority support

**Business - $39/month**
- Unlimited websites
- All Pro features
- API access
- White-label (remove branding)
- Team collaboration (5 users)

### Trial Strategy
- **7-day free trial** with full feature access
- **Credit card required** (filters serious users)
- **No free tier** to avoid resource drain
- **Cancel anytime** with prorated refunds

## Success Metrics

### Product Metrics
- Widget installations
- Feedback submissions per widget
- Customer response rate
- Dashboard daily active users

### Business Metrics
- Monthly recurring revenue (MRR)
- Customer lifetime value (LTV)
- Monthly churn rate
- Trial to paid conversion rate
- Customer acquisition cost (CAC)

### Growth Targets
- Month 1: 20 customers, $300 MRR
- Month 3: 100 customers, $1,500 MRR  
- Month 6: 300 customers, $4,500 MRR
- Month 12: 700 customers, $10,500 MRR ($126K ARR)

## Competitive Positioning

### vs FeedbackFast
- Better UI/UX design
- Continuous updates and improvements (vs one-time purchase)
- Superior developer experience
- Sustainable pricing ($9/month vs $9 lifetime - better long-term value)

### vs Canny
- Much simpler (no feature voting complexity)
- 5x cheaper ($9-39 vs $50-400/month)
- Faster setup and implementation
- Better for small teams vs enterprise focus

## Go-to-Market Strategy

### Launch Channels
1. **Product Hunt** - Launch day exposure
2. **Indie Hacker communities** - Twitter, Discord, Reddit
3. **Developer platforms** - Dev.to, Hacker News
4. **Direct outreach** - Small SaaS founders
5. **SEO content** - "How to collect feedback", "FeedbackFast alternatives"

### Content Strategy
- Build in public on Twitter
- Case studies from early customers  
- Tutorial content for implementation
- Comparison guides vs competitors

### Partnership Strategy
- Integrate with popular no-code tools
- Partner with SaaS boilerplates/templates
- Developer tool directories

## Technical Architecture

### Widget Implementation
```javascript
// Lightweight embed script
<script>
!function(){
  var script = document.createElement('script');
  script.src = 'https://widget.feedbacksimple.com/widget.js';
  script.setAttribute('data-project', 'YOUR_PROJECT_ID');
  document.head.appendChild(script);
}();
</script>
```

### Database Schema
```
Users: id, email, name, created_at
Projects: id, user_id, name, domain, settings, created_at  
Feedback: id, project_id, message, category, user_email, page_url, user_agent, status, created_at
Responses: id, feedback_id, message, admin_id, created_at
```

### Key Integrations
- Supabase for real-time updates
- Resend for transactional emails
- Polar.sh for payment processing

## Risk Mitigation

### Technical Risks
- Widget conflicts with customer sites: Extensive testing, namespaced CSS
- High storage costs: Compress images, implement retention policies
- Performance issues: CDN for widget delivery, database optimization

### Business Risks  
- FeedbackFast competition: Focus on superior UX and continuous improvements
- Market saturation: Expand to adjacent markets (support tickets, surveys)
- Subscription churn: Focus on customer success and feature development

## Success Definition
- **Technical**: 99.9% widget uptime, <500ms load time
- **Product**: 4+ star average customer rating, <5% churn
- **Business**: $126K ARR in first year, <5% monthly churn, positive unit economics
- **Market**: Top 3 "FeedbackFast alternative" search results

---

**Focus:** Build a simple, beautiful feedback collection tool that indie hackers actually want to use and can afford.
