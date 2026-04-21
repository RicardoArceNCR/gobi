# GOBi Hardening Strategy

This document formalizes the backend patterns and future governance strategies to move from a prototype to a production-ready system.

## 1. Data Contract Standards

### Summary vs. Detail Pattern
To optimize bandwidth and frontend performance, every major entity must follow a strictly separated payload strategy:

- **Resumen (Summary)**: Used for listings. Contains only essential fields and pre-calculated counts (e.g., `miembros_count`).
- **Detalle (Detail)**: Used for single-entity views. Includes full relationships, history, and metadata.
- **Brief (Minimum)**: Used for nested objects within other entities to prevent circular dependencies and payload bloat.

### Pagination Strategy
All listing endpoints MUST return a `PaginatedResponse<T>` containing:
- `items`: The requested page slice.
- `total`: Global count.
- `page`: Current page number.
- `page_size`: Items per page.
- `total_pages`: Calculated total.

## 2. Audit Trail (Bitácora)

### Entities to Audit
1.  **Proyecto**: Creations, state changes, and document additions.
2.  **Diputado**: Profile updates and party changes.
3.  **Comisión**: Membership changes and project assignments.

### Action Types
- `CREATE`: Initial entity creation.
- `UPDATE`: Modification of sensitive fields.
- `DELETE`: Logical or physical deletion.
- `STATE_CHANGE`: Specific to project workflow transitions.

### Log Structure
| Field | Type | Description |
| :--- | :--- | :--- |
| `timestamp` | `DateTime` | When the action occurred. |
| `user_id` | `UUID` | Who performed the action. |
| `action` | `String` | Type of change (CREATE, UPDATE, etc.). |
| `entity_type` | `String` | Project, Diputado, Comision. |
| `entity_id` | `UUID` | Reference to the object. |
| `changes` | `JSON` | Diff of before vs after for relevant fields. |

## 3. Permission Matrix

| Operation | Ciudadano | Diputado | Admin |
| :--- | :---: | :---: | :---: |
| View Projects/Cards/Commissions | ✅ | ✅ | ✅ |
| Download Documents | ✅ | ✅ | ✅ |
| Propose State Change | ❌ | ✅ | ✅ |
| Approve State Change | ❌ | ❌ | ✅ |
| Edit Profiles/Entities | ❌ | ❌ | ✅ |
| View System Logs | ❌ | ❌ | ✅ |

## 4. Technical Debt to Address
- **Caching**: Implement Redis for frequently accessed listings (Commissions, Themes).
- **Date Standardization**: Ensure all modules use native `Date` types instead of strings (Migrated in Phase 3.5).
- **Type Safety**: Eliminate `any` in frontend adapters and views.
