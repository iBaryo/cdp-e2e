import {BusinessUnitId, WorkspaceId} from "../SDK/entities";
import {SecretCredentials} from "../SDK/Signers/SimpleRequestSigner";
import {WorkspaceLease} from "./WorkspaceLease";
import {WithTenantId} from "../sdk/entities/common";

export interface BusinessUnitInfo extends WithTenantId {
    workspaceId: WorkspaceId;
    bUnitId: BusinessUnitId;
}

export interface LeaseInfo extends BusinessUnitInfo {
    apiCredentials: SecretCredentials;
    loginCredentials: WorkspaceLease['Credentials']['userKeys']['Universe']['properties'];
}

export interface WFSLeaseInfo extends LeaseInfo {
    id: string;
    created: Date;
    duration?: number;
}
