export interface Permission {
    id: string;
    module_key: string;
    action: string;
    name: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
}

export interface RoleWithPermissions extends Role {
    permissions: string[]; // List of permission keys: moduleKey_action
}

export interface Module {
    key: string;
    name: string;
    icon: string;
}
