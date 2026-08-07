from fastapi import Request, HTTPException, status, Depends
from typing import Optional

async def get_current_tenant_id(request: Request) -> Optional[str]:
    """
    Middleware dependency extracting multi-tenant organization context
    from HTTP headers (`X-Tenant-ID` or `X-Tenant-Domain`) or Host header.
    """
    tenant_header = request.headers.get("X-Tenant-ID") or request.headers.get("X-Tenant-Domain")
    if tenant_header:
        return tenant_header

    # Extract subdomain from host (e.g. wso2.hirepath.lk -> wso2)
    host = request.headers.get("host", "")
    if "." in host:
        subdomain = host.split(".")[0]
        if subdomain not in ["www", "app", "localhost", "127"]:
            return subdomain

    return "default-tenant"
