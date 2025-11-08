"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRBAC = seedRBAC;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Define roles and their permissions
const rolesAndPermissions = [
    {
        role: 'PATIENT',
        description: 'Regular patient user',
        permissions: [
            { name: 'appointments:read', resource: 'appointments', action: 'read', description: 'View own appointments' },
            { name: 'appointments:create', resource: 'appointments', action: 'create', description: 'Book appointments' },
            { name: 'appointments:update', resource: 'appointments', action: 'update', description: 'Update own appointments' },
            { name: 'medical_records:read', resource: 'medical_records', action: 'read', description: 'View own medical records' },
            { name: 'profile:read', resource: 'profile', action: 'read', description: 'View own profile' },
            { name: 'profile:update', resource: 'profile', action: 'update', description: 'Update own profile' },
            { name: 'messages:read', resource: 'messages', action: 'read', description: 'Read messages' },
            { name: 'messages:send', resource: 'messages', action: 'create', description: 'Send messages' },
        ]
    },
    {
        role: 'DOCTOR',
        description: 'Medical doctor/specialist',
        permissions: [
            { name: 'appointments:read', resource: 'appointments', action: 'read', description: 'View appointments' },
            { name: 'appointments:manage', resource: 'appointments', action: 'manage', description: 'Manage appointments' },
            { name: 'medical_records:read', resource: 'medical_records', action: 'read', description: 'View patient medical records' },
            { name: 'medical_records:write', resource: 'medical_records', action: 'write', description: 'Create/update medical records' },
            { name: 'prescriptions:write', resource: 'prescriptions', action: 'write', description: 'Write prescriptions' },
            { name: 'treatment_plans:manage', resource: 'treatment_plans', action: 'manage', description: 'Manage treatment plans' },
            { name: 'profile:read', resource: 'profile', action: 'read', description: 'View own profile' },
            { name: 'profile:update', resource: 'profile', action: 'update', description: 'Update own profile' },
            { name: 'patients:read', resource: 'patients', action: 'read', description: 'View patient information' },
            { name: 'messages:read', resource: 'messages', action: 'read', description: 'Read messages' },
            { name: 'messages:send', resource: 'messages', action: 'create', description: 'Send messages' },
        ]
    },
    {
        role: 'CLINIC',
        description: 'Clinic staff member',
        permissions: [
            { name: 'appointments:read', resource: 'appointments', action: 'read', description: 'View appointments' },
            { name: 'appointments:manage', resource: 'appointments', action: 'manage', description: 'Manage appointments' },
            { name: 'patients:read', resource: 'patients', action: 'read', description: 'View patient information' },
            { name: 'patients:create', resource: 'patients', action: 'create', description: 'Register new patients' },
            { name: 'doctors:read', resource: 'doctors', action: 'read', description: 'View doctor information' },
            { name: 'medical_records:read', resource: 'medical_records', action: 'read', description: 'View medical records' },
            { name: 'profile:read', resource: 'profile', action: 'read', description: 'View own profile' },
            { name: 'profile:update', resource: 'profile', action: 'update', description: 'Update own profile' },
        ]
    },
    {
        role: 'PROJECT_TEAM',
        description: 'ChifaaCare project team member',
        permissions: [
            { name: 'appointments:read', resource: 'appointments', action: 'read', description: 'View all appointments' },
            { name: 'patients:read', resource: 'patients', action: 'read', description: 'View patient information' },
            { name: 'doctors:read', resource: 'doctors', action: 'read', description: 'View doctor information' },
            { name: 'doctors:manage', resource: 'doctors', action: 'manage', description: 'Manage doctor accounts' },
            { name: 'clinics:read', resource: 'clinics', action: 'read', description: 'View clinic information' },
            { name: 'clinics:manage', resource: 'clinics', action: 'manage', description: 'Manage clinic accounts' },
            { name: 'analytics:read', resource: 'analytics', action: 'read', description: 'View analytics and reports' },
            { name: 'profile:read', resource: 'profile', action: 'read', description: 'View own profile' },
            { name: 'profile:update', resource: 'profile', action: 'update', description: 'Update own profile' },
        ]
    },
    {
        role: 'ADMIN',
        description: 'System administrator',
        permissions: [
            { name: 'users:manage', resource: 'users', action: 'manage', description: 'Full user management' },
            { name: 'roles:manage', resource: 'roles', action: 'manage', description: 'Manage roles and permissions' },
            { name: 'appointments:manage', resource: 'appointments', action: 'manage', description: 'Manage all appointments' },
            { name: 'medical_records:manage', resource: 'medical_records', action: 'manage', description: 'Manage all medical records' },
            { name: 'doctors:manage', resource: 'doctors', action: 'manage', description: 'Manage doctor accounts' },
            { name: 'patients:manage', resource: 'patients', action: 'manage', description: 'Manage patient accounts' },
            { name: 'clinics:manage', resource: 'clinics', action: 'manage', description: 'Manage clinic accounts' },
            { name: 'analytics:read', resource: 'analytics', action: 'read', description: 'View analytics and reports' },
            { name: 'system:manage', resource: 'system', action: 'manage', description: 'System configuration' },
        ]
    }
];
async function seedRBAC() {
    console.log('🌱 Seeding RBAC data...');
    try {
        // Create all unique permissions first
        const allPermissions = new Map();
        for (const roleData of rolesAndPermissions) {
            for (const perm of roleData.permissions) {
                if (!allPermissions.has(perm.name)) {
                    allPermissions.set(perm.name, perm);
                }
            }
        }
        console.log(`Creating ${allPermissions.size} permissions...`);
        for (const [name, perm] of allPermissions) {
            await prisma.permission.upsert({
                where: { name },
                update: {},
                create: {
                    name: perm.name,
                    resource: perm.resource,
                    action: perm.action,
                    description: perm.description
                }
            });
        }
        console.log('✅ Permissions created');
        // Create roles and assign permissions
        for (const roleData of rolesAndPermissions) {
            console.log(`Creating role: ${roleData.role}...`);
            const role = await prisma.role.upsert({
                where: { name: roleData.role },
                update: { description: roleData.description },
                create: {
                    name: roleData.role,
                    description: roleData.description
                }
            });
            // Assign permissions to role
            for (const perm of roleData.permissions) {
                const permission = await prisma.permission.findUnique({
                    where: { name: perm.name }
                });
                if (permission) {
                    await prisma.rolePermission.upsert({
                        where: {
                            roleId_permissionId: {
                                roleId: role.id,
                                permissionId: permission.id
                            }
                        },
                        update: {},
                        create: {
                            roleId: role.id,
                            permissionId: permission.id
                        }
                    });
                }
            }
            console.log(`✅ Role ${roleData.role} created with ${roleData.permissions.length} permissions`);
        }
        console.log('🎉 RBAC seeding completed successfully!');
    }
    catch (error) {
        console.error('❌ Error seeding RBAC:', error);
        throw error;
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run if called directly
if (require.main === module) {
    seedRBAC()
        .then(() => process.exit(0))
        .catch((error) => {
        console.error(error);
        process.exit(1);
    });
}
