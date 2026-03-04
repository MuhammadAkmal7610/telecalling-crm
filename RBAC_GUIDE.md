# RBAC Security Guide — telecalling.crm

This document outlines the Role-Based Access Control (RBAC) hierarchy and permissions enforced across the CRM to ensure multi-tenant security and data integrity.

## Role Hierarchy

The CRM follows a strict hierarchy where higher roles inherit permissions from lower ones.

`Root > Admin > Manager > Marketing (Not used) > Caller`

---

## 🔑 Role Definitions & Permissions

### 1. Root User (Organization Owner)
- **Identity**: The user who originally signed up the organization.
- **Permissions**:
    - **Global Access**: Can perform ANY action across ALL workspaces in the organization.
    - **User Management**: Invite, Suspend, Reactivate, and Delete any user.
    - **System Config**: Manage Workflows, Lead Stages, Custom Fields, and Integrations.
    - **Billing**: Access to billing and license management.

### 2. Administrator (Admin)
- **Identity**: Users assigned the 'admin' role by the Root user.
- **Permissions**:
    - **Full Control**: Same as Root within the scoped organization.
    - **Workspace Management**: Can create and delete workspaces.
    - **Team Management**: Can manage users and roles.

### 3. Manager
- **Identity**: Team leads or supervisors.
- **Permissions**:
    - **Data Insights**: Full access to all Reports and Dashboard stats.
    - **Lead Management**: Can view ALL leads in a workspace, bulk assign leads, and delete leads.
    - **Campaigns**: Can create, update, and manage campaigns.
    - **Restrictions**: Cannot modify system configurations (Workflows, Fields, Stages) or manage users.

### 4. Caller (Standard Agent)
- **Identity**: The primary users making calls and processing leads.
- **Permissions**:
    - **Lead Processing**: View and update leads assigned to them.
    - **Activity**: Log calls and notes.
    - **Workspace Awareness**: Can see other team members but cannot manage them.
    - **Restrictions**: Cannot delete leads, cannot import leads, cannot see full team reports, and cannot access any admin/manager settings.

---

## 🛡️ Multi-Tenancy Enforcement

Every request is strictly validated against two core identifiers:
1. `organization_id`: Ensures data isolation between different companies.
2. `workspace_id` (where applicable): Ensures segmentation within a single company.

**Example**: A Manager from *Org A* can never see leads or reports from *Org B*, even if they have the same role.

---

## 🚦 Verification Checklist

| Action | Root/Admin | Manager | Caller |
| :--- | :---: | :---: | :---: |
| Invite Users | ✅ | ❌ | ❌ |
| Create Workspaces | ✅ | ❌ | ❌ |
| Manage Workflows | ✅ | ❌ | ❌ |
| Manage Lead Stages | ✅ | ❌ | ❌ |
| Bulk Assign Leads | ✅ | ✅ | ❌ |
| View Full Reports | ✅ | ✅ | ❌ |
| Update Lead Status | ✅ | ✅ | ✅ |
| Delete Lead | ✅ | ✅ | ❌ |
