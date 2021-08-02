/*
as returned from WFS endpoint
 */
export interface WorkspaceLease {
    Credentials: {
        partnerIds: {
            Rest: string
            Second: string
        }
        userKeyInfo: {
            privateRsaPem: string
            properties: any
            role: string
            userKey: string
            userSecret: string
        }
        userKeys: {
            Config: {
                privateRsaPem: string
                properties: any
                role: string
                userKey: string
            }
            Everyone: {
                privateRsaPem: string
                properties: {}
                role: string
                userKey: string
            }
            Ingestion: {
                privateRsaPem: string
                properties: any
            }
            role: string
            userKey: string
            Managing: {
                privateRsaPem: string
                properties: any
                role: string
                userKey: string
                userSecret: string
            }
            Universe: {
                properties: {
                    username: string
                    password: string
                }
                userKey: string
                userSecret: string
            }
        }
    }
    Info: {
        attemptsCount: 0
        created: string
        duration: string
        leaseId: string
        partnerId: string
        scheduled: string
        status: string
        trace: {
            CallId: string
            TestName: string
            UserKey: string
        }
        updated: string
        workspaceId: string
        businessUnitId: string
        tenantId: string
    }
    id: string
}
