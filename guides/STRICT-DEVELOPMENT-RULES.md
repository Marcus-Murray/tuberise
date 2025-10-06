# STRICT DEVELOPMENT RULES

## CRITICAL: MANDATORY COMPLIANCE

These rules are **NON-NEGOTIABLE** and must be followed at all times. Any violation will result in immediate correction and potential termination of the development session.

## 0. SIMPLE & MODULAR ARCHITECTURE

### 0.1 Simple & Modular Development Approach

**MANDATORY** adherence to Simple & Modular Approach for all development:

#### Core Benefits:
- **Easier Debugging**: Issues isolated to one module
- **Faster Development**: Work on one feature at a time
- **Better Testing**: Each module tested independently
- **Easier Updates**: Change one module without affecting others
- **Clear Dependencies**: Easy to see what depends on what

#### Module Rules:
1. **Module Isolation**: Each module must be self-contained and independent
2. **No Cross-Dependencies**: Modules cannot depend on each other directly
3. **Single Responsibility**: Each module handles only one concern
4. **Clear Interfaces**: Simple, intuitive function signatures
5. **Independent Testing**: Each module must be testable independently

**Rule File**: `guides/SIMPLE-MODULAR-DEVELOPMENT-RULES.md`
**Activation**: Applied to ALL development work

## 1. SYSTEMATIC PROBLEM SOLVING

### 1.1 7-Possible-Solutions Thinking Framework

When faced with complex problems, architectural decisions, or multiple implementation approaches, **MANDATORY** use of the 7-Possible-Solutions Thinking Framework:

- **ALWAYS** analyze 7 different approaches before implementation
- **ALWAYS** provide detailed pros/cons for each solution
- **ALWAYS** include feasibility, effectiveness, and risk assessments
- **ALWAYS** provide clear rationale for the chosen solution
- **ALWAYS** create an implementation plan with next steps

**Rule File**: `guides/7-possible-solutions-thinking-rule.md`
**Activation**: Triggered by requests for "systematic analysis", "different approaches", or complex problem-solving scenarios.

## 1. AUTHORIZATION REQUIREMENTS

### 1.1 Explicit Permission Required

- **NEVER** make changes without explicit user permission
- **NEVER** delete files without explicit user approval
- **NEVER** modify existing functionality without user consent
- **ALWAYS** ask before implementing new features
- **ALWAYS** confirm before making architectural changes

### 1.2 Permission Format

When requesting permission, use this exact format:

```
**Action Required:** [Specific action description]
**Files Affected:** [List specific files]
**Risk Level:** [Low/Medium/High]
**Permission needed:** May I proceed with [specific action]?
```

## 2. CHANGE MANAGEMENT

### 2.1 Single Change Principle

- Make **ONE** change at a time
- Wait for user approval before proceeding to the next change
- **NEVER** batch multiple changes together
- **NEVER** make "quick fixes" without permission

### 2.2 Documentation First

- **ALWAYS** reference existing documentation before making changes
- **ALWAYS** verify compliance with project documentation
- **NEVER** deviate from established patterns without approval

### 2.3 Revert Capability

- **ALWAYS** ensure changes can be easily reverted
- **ALWAYS** test changes before committing
- **NEVER** make irreversible changes without explicit backup

## 3. COMMUNICATION PROTOCOLS

### 3.1 Status Reporting

- Provide clear status updates after each action
- Explain what was done and why
- Confirm completion before proceeding

### 3.2 Error Handling

- **IMMEDIATELY** stop and report any errors
- **NEVER** attempt to fix errors without user guidance
- **ALWAYS** provide detailed error information

### 3.3 Question Protocol

- Ask clarifying questions when uncertain
- **NEVER** make assumptions about user intent
- **ALWAYS** confirm understanding before proceeding

## 4. CODE QUALITY STANDARDS

### 4.1 Compliance Verification

- **ALWAYS** verify compliance with all project documentation
- **ALWAYS** check API compliance requirements
- **ALWAYS** ensure security best practices
- **NEVER** implement features that violate compliance

### 4.2 Testing Requirements

- **ALWAYS** test changes before reporting completion
- **ALWAYS** verify integrations work correctly
- **NEVER** assume functionality works without testing

### 4.3 Documentation Updates

- **ALWAYS** update relevant documentation after changes
- **ALWAYS** maintain consistency across all documents
- **NEVER** leave documentation outdated

## 5. EMERGENCY PROTOCOLS

### 5.1 Rule Violation Response

If rules are violated:

1. **IMMEDIATELY** stop all actions
2. Acknowledge the violation
3. Ask for guidance on how to proceed
4. **NEVER** continue without explicit permission

### 5.2 Recovery Procedures

- **ALWAYS** know how to revert changes
- **ALWAYS** maintain project integrity
- **NEVER** leave the project in a broken state

## 6. PROJECT-SPECIFIC RULES

### 6.1 Tuberise Analytics Compliance

- **ALWAYS** maintain compliance with YouTube Developer Policies
- **ALWAYS** maintain compliance with Notion Developer Guidelines
- **ALWAYS** maintain compliance with Google OAuth 2.0 Policies
- **ALWAYS** maintain compliance with AI Compliance Framework

### 6.2 Architecture Preservation

- **ALWAYS** maintain the modular monorepo architecture
- **ALWAYS** follow the established package structure
- **NEVER** break existing integrations
- **ALWAYS** maintain TypeScript configuration integrity

### 6.3 Security Requirements

- **ALWAYS** maintain security middleware
- **ALWAYS** protect sensitive data
- **ALWAYS** follow authentication best practices
- **NEVER** expose sensitive information

## 7. ENFORCEMENT

### 7.1 Self-Monitoring

- **CONSTANTLY** self-check against these rules
- **IMMEDIATELY** correct any violations
- **ALWAYS** prioritize rule compliance over speed

### 7.2 User Oversight

- Accept user corrections immediately
- Implement user feedback without question
- **NEVER** argue about rule enforcement

## 8. ACKNOWLEDGMENT

By continuing to work on this project, I acknowledge that:

- These rules are **MANDATORY** and **NON-NEGOTIABLE**
- Violation of these rules is unacceptable
- I will be held accountable for any rule violations
- User satisfaction and project integrity are the top priorities

---

**Last Updated:** December 2024
**Status:** ACTIVE - MUST BE FOLLOWED
**Violation Consequences:** Immediate correction and potential session termination
