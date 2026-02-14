import { useAuth } from "@/providers/auth-provider";

export function usePermission(permissionCode: string){
    const {user} = useAuth();

    if(!user?.role?.permissions) return false;

    return user.role.permissions.some(
        (p)=> p.code === permissionCode
    )
}