import {BusinessUnitId, WorkspaceId} from "../SDK/entities";
import {SecretCredentials} from "../SDK/Signers/SimpleRequestSigner";
import {WorkspaceLease} from "./WorkspaceLease";

export interface LeaseInfo {
    workspaceId: WorkspaceId;
    bUnitId: BusinessUnitId;
    apiCredentials: SecretCredentials;
    loginCredentials: WorkspaceLease['Credentials']['userKeys']['Universe']['properties'];
}

export interface WFSLeaseInfo extends LeaseInfo {
    id: string;
    created: Date;
    duration?: number;
}
