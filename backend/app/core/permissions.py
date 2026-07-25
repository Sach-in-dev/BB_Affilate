"""Central catalog of permissions and default roles for the affiliate platform.

Permission keys map to functional modules described in the Affiliate Platform SOW.
Frontend and backend both rely on these keys, so keep them stable.
"""

PERMISSIONS = [
    {"key": "manage_users", "label": "Manage Users & Roles", "group": "Administration"},
    {"key": "manage_commissions", "label": "Manage Commissions", "group": "Commerce"},
    {"key": "manage_campaigns", "label": "Manage Campaigns", "group": "Commerce"},
    {"key": "manage_products", "label": "Manage Products", "group": "Commerce"},
    {"key": "manage_creators", "label": "Manage Creators", "group": "Creators"},
    {"key": "manage_banners", "label": "Manage Banners", "group": "Content"},
    {"key": "manage_links", "label": "Manage Links", "group": "Content"},
    {"key": "view_analytics", "label": "View Analytics", "group": "Insights"},
]

ALL_PERMISSION_KEYS = [p["key"] for p in PERMISSIONS]

DEFAULT_ROLES = [
    {
        "name": "super_admin",
        "label": "Super Admin",
        "description": "Full, unrestricted access to every module including admin user management.",
        "permissions": ALL_PERMISSION_KEYS,
        "is_system": True,
    },
    {
        "name": "admin",
        "label": "Admin",
        "description": "Manage the whole platform except creating or editing other admin users.",
        "permissions": [k for k in ALL_PERMISSION_KEYS if k != "manage_users"],
        "is_system": True,
    },
    {
        "name": "manager",
        "label": "Manager",
        "description": "Run campaigns, creators, banners and links; view analytics.",
        "permissions": ["manage_campaigns", "manage_creators", "manage_banners", "manage_links", "view_analytics"],
        "is_system": True,
    },
    {
        "name": "viewer",
        "label": "Viewer",
        "description": "Read-only access to analytics and reporting.",
        "permissions": ["view_analytics"],
        "is_system": True,
    },
]

# Default super-admin bootstrapped on first run.
DEFAULT_ADMIN = {
    "first_name": "Super",
    "last_name": "Admin",
    "email": "admin@beautybarn.in",
    "password": "Admin@123",
    "role_name": "super_admin",
}
