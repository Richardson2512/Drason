# Drason Documentation

Comprehensive documentation for the Drason platform - an outbound execution control layer between Clay (lead enrichment) and Smartlead (email campaigns).

## Directory Structure

### 📚 `/guides` - User Guides & Onboarding
User-facing documentation and implementation guides:
- [WARMUP_RECOVERY_GUIDE.md](./guides/WARMUP_RECOVERY_GUIDE.md) - Complete guide to mailbox warmup and graduated recovery system
- [platform_rules_and_enforcement.md](./guides/platform_rules_and_enforcement.md) - Platform rules and health enforcement policies
- [drason_mvp_engineering_prd.md](./guides/drason_mvp_engineering_prd.md) - Original MVP product requirements
- [drason-infrastructure-walkthrough.md](./guides/drason-infrastructure-walkthrough.md) - Infrastructure health dashboard walkthrough
- [brownfield-onboarding-implementation-plan.md](./guides/brownfield-onboarding-implementation-plan.md) - Onboarding flow implementation plan

### 🔌 `/api` - API & Integration Documentation
API documentation and third-party integrations:
- [smartlead-api-docs.rtf](./api/smartlead-api-docs.rtf) - Official Smartlead API documentation
- [POLAR_SETUP.md](./api/POLAR_SETUP.md) - Polar.sh billing integration setup
- [WEBHOOK_SECURITY_ANALYSIS.md](./api/WEBHOOK_SECURITY_ANALYSIS.md) - Webhook security implementation analysis
- [UTILITY_INTEGRATION_GUIDE.md](./api/UTILITY_INTEGRATION_GUIDE.md) - Utility components and reusable hooks

### 🏗️ `/architecture` - System Architecture
System design, architecture decisions, and technical specifications:
- [monitoring-logic.rtf](./architecture/monitoring-logic.rtf) - Monitoring and observability logic
- [drason_infrastructure_architecture_audit_report.md](./architecture/drason_infrastructure_architecture_audit_report.md) - Infrastructure architecture audit
- [monitoring_before_after.md](./architecture/monitoring_before_after.md) - Monitoring system improvements
- [RESILIENCE_SCORING.md](./architecture/RESILIENCE_SCORING.md) - Resilience scoring algorithm and graduated recovery

### ⚙️ `/operations` - Operations & Deployment
Deployment, environment setup, and operational procedures:
- [ENVIRONMENT_VARIABLES.md](./operations/ENVIRONMENT_VARIABLES.md) - Frontend environment variables
- [backend-environment-variables.md](./operations/backend-environment-variables.md) - Backend environment variables
- [DEPLOYMENT_CHECKLIST.md](./operations/DEPLOYMENT_CHECKLIST.md) - Pre-deployment checklist
- [DEBUG_BILLING_ERROR.md](./operations/DEBUG_BILLING_ERROR.md) - Billing error debugging guide

### 📊 `/reports` - Audit Reports & Analysis
Technical audit reports and implementation summaries:
- [API_AUDIT_REPORT.md](./reports/API_AUDIT_REPORT.md) - Comprehensive API endpoint audit
- [AUDIT_REPORT.md](./reports/AUDIT_REPORT.md) - Full system audit report
- [AUTOMATED_RECOVERY_ACTION_PLAN.md](./reports/AUTOMATED_RECOVERY_ACTION_PLAN.md) - Automated recovery implementation plan
- [BILLING_FLOW_UPDATES.md](./reports/BILLING_FLOW_UPDATES.md) - Billing flow updates and fixes
- [CLEANUP_SUMMARY.md](./reports/CLEANUP_SUMMARY.md) - Codebase cleanup summary
- [ENDPOINT_INTEGRATION_OPPORTUNITIES.md](./reports/ENDPOINT_INTEGRATION_OPPORTUNITIES.md) - API integration opportunities
- [IMPLEMENTATION_COMPLETE.md](./reports/IMPLEMENTATION_COMPLETE.md) - Implementation completion status
- [TRAJECTORY_INTEGRATION_PLAN.md](./reports/TRAJECTORY_INTEGRATION_PLAN.md) - Trajectory tracking integration plan
- [verification_audit.md](./reports/verification_audit.md) - System verification audit
- [API_AUDIT_FINDINGS.md](./reports/API_AUDIT_FINDINGS.md) - Backend API audit findings

## Quick Links

### Getting Started
- [MVP PRD](./guides/drason_mvp_engineering_prd.md) - Understand the product vision
- [Infrastructure Walkthrough](./guides/drason-infrastructure-walkthrough.md) - Navigate the dashboard
- [Platform Rules](./guides/platform_rules_and_enforcement.md) - Understand enforcement policies

### For Developers
- [Deployment Checklist](./operations/DEPLOYMENT_CHECKLIST.md) - Pre-deployment steps
- [Environment Variables](./operations/ENVIRONMENT_VARIABLES.md) - Required configuration
- [API Documentation](./api/smartlead-api-docs.rtf) - Smartlead API reference

### System Administration
- [Warmup Recovery System](./guides/WARMUP_RECOVERY_GUIDE.md) - Mailbox healing workflows
- [Resilience Scoring](./architecture/RESILIENCE_SCORING.md) - Scoring algorithm details
- [Monitoring Logic](./architecture/monitoring-logic.rtf) - Observability architecture

## Contributing

When adding new documentation:
1. Choose the appropriate directory based on content type
2. Use descriptive filenames with hyphens (e.g., `new-feature-guide.md`)
3. Update this README with a link to your new document
4. Follow markdown formatting conventions

## Support

For questions about this documentation, contact the development team or create an issue in the repository.
